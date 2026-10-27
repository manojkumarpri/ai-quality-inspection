import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/authentication";
import { requireRole } from "../middleware/authorization";
import { getAIProvider } from "../services/ai/ai-provider-factory";
import { isValidDefectType } from "../services/taxonomy";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

const uploadDir = process.env.IMAGE_STORAGE_DIR || "./storage/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_BYTES) || 10485760 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

router.post(
  "/predict",
  authenticate,
  requireRole("QUALITY_ENGINEER"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      const aiProvider = getAIProvider();
      const { batchId } = req.body;
      if (!batchId || !req.file) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "batchId and image are required.",
          },
        });
      }

      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!batch) {
        return res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Batch not found." } });
      }

      // 1. First, create the database prediction record so we get its official UUID (prediction.id)
      // (Wait, we need the file saved first? Let's generate a predictionId upfront using uuidv4!)
      const predictionId = uuidv4();
      const fileExtension = path.extname(req.file.originalname) || ".jpg";

      // 2. Name the file using the predictionId directly!
      const newFileName = `${predictionId}${fileExtension}`;
      const newPath = path.join(uploadDir, newFileName);
      fs.renameSync(req.file.path, newPath);

      // const predictionResult = await classifyImageWithGemini(newPath, req.file.mimetype);
      const predictionResult = await aiProvider.classifyImage(
        newPath,
        req.file.mimetype,
      );

      // 3. Save to AIPrediction table using that exact ID
      const prediction = await prisma.aIPrediction.create({
        data: {
          id: predictionId, // Explicitly use our matched UUID
          batchId,
          provider: predictionResult.provider,
          model: predictionResult.model,
          predictedDefectType: predictionResult.defectType,
          confidence: predictionResult.confidence,
          createdById: req.user!.id,
        },
      });

      res.json({
        data: {
          predictionId: prediction.id,
          batchId,
          imageRef: newFileName, // This is now exactly prediction.id + extension
          imageUrl: `/api/images/${newFileName}`,
          predictedDefectType: prediction.predictedDefectType,
          confidence: prediction.confidence,
        },
      });
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      next(error);
    }
  },
);

const submitSchema = z.object({
  batchId: z.string().uuid(),
  predictionId: z.string().uuid(),
  finalDefectType: z.string().refine(isValidDefectType),
  comments: z.string().optional(),
});

router.post(
  "/",
  authenticate,
  requireRole("QUALITY_ENGINEER"),
  async (req, res, next) => {
    try {
      const body = submitSchema.parse(req.body);

      const prediction = await prisma.aIPrediction.findUnique({
        where: { id: body.predictionId },
      });

      if (!prediction || prediction.batchId !== body.batchId) {
        return res.status(400).json({
          error: {
            code: "INVALID_PREDICTION",
            message: "Prediction not found or batch mismatch.",
          },
        });
      }

      const existingInspection = await prisma.inspection.findUnique({
        where: { predictionId: body.predictionId },
      });

      if (existingInspection) {
        return res.status(409).json({
          error: {
            code: "CONFLICT",
            message: "Inspection already submitted.",
          },
        });
      }

      const wasOverridden =
        body.finalDefectType !== prediction.predictedDefectType;

      const inspection = await prisma.inspection.create({
        data: {
          batchId: body.batchId,
          predictionId: body.predictionId,
          imageRef: `${body.predictionId}.jpg`,
          aiPredictedDefectType: prediction.predictedDefectType,
          aiConfidence: prediction.confidence,
          finalDefectType: body.finalDefectType,
          wasOverridden,
          comments: body.comments,
          inspectorId: req.user!.id,
        },
        include: { inspector: true },
      });

      res.status(201).json({
        data: {
          id: inspection.id,
          batchId: inspection.batchId,
          predictionId: inspection.predictionId,
          aiPredictedDefectType: inspection.aiPredictedDefectType,
          aiConfidence: inspection.aiConfidence,
          finalDefectType: inspection.finalDefectType,
          wasOverridden: inspection.wasOverridden,
          inspector: {
            id: inspection.inspector.id,
            name: inspection.inspector.name,
          },
          inspectedAt: inspection.inspectedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { defectType, batchId } = req.query;
    const whereClause: any = {};
    if (defectType && isValidDefectType(defectType as string)) {
      whereClause.finalDefectType = defectType;
    }
    if (batchId) {
      whereClause.batchId = batchId;
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      include: { inspector: true, batch: true },
      orderBy: { inspectedAt: "desc" },
    });

    res.json({
      data: inspections.map((i) => ({
        id: i.id,
        batchId: i.batchId,
        batchCode: i.batch.batchCode,
        productName: i.batch.productName,
        imageUrl: `/api/images/${i.predictionId}.jpg`,
        aiPredictedDefectType: i.aiPredictedDefectType,
        aiConfidence: i.aiConfidence,
        finalDefectType: i.finalDefectType,
        wasOverridden: i.wasOverridden,
        comments: i.comments,
        inspector: i.inspector.name,
        inspectedAt: i.inspectedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

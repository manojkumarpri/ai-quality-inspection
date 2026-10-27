import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/authentication";
import { DEFECT_TYPES } from "../services/taxonomy";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const inspections = await prisma.inspection.findMany();

    const totalInspected = inspections.length;
    const passed = inspections.filter(
      (i) => i.finalDefectType === "No Defect",
    ).length;
    const rejected = totalInspected - passed;

    const defectRate =
      totalInspected === 0
        ? 0
        : Number(((rejected / totalInspected) * 100).toFixed(1));
    const acceptedCount = inspections.filter((i) => !i.wasOverridden).length;
    const aiAcceptanceRate =
      totalInspected === 0
        ? 0
        : Number(((acceptedCount / totalInspected) * 100).toFixed(1));

    const defectBreakdown = DEFECT_TYPES.filter((dt) => dt !== "No Defect").map(
      (defectType) => {
        const count = inspections.filter(
          (i) => i.finalDefectType === defectType,
        ).length;
        return { defectType, count };
      },
    );

    res.json({
      data: {
        totalInspected,
        passed,
        rejected,
        defectRate,
        aiAcceptanceRate,
        defectBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

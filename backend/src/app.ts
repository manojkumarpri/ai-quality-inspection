import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/auth.routes";
import batchRoutes from "./routes/batches.routes";
import inspectionRoutes from "./routes/inspections.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { errorHandler } from "./middleware/error-handler";
import { authenticate } from "./middleware/authentication";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/images/:imageKey", authenticate, (req, res) => {
  const imageKey = req.params.imageKey;
  if (
    !imageKey ||
    imageKey.includes("..") ||
    imageKey.includes("/") ||
    imageKey.includes("\\")
  ) {
    return res
      .status(400)
      .json({ error: { code: "INVALID_PATH", message: "Invalid image key." } });
  }

  const uploadDir = path.resolve(
    process.env.IMAGE_STORAGE_DIR || "./storage/uploads",
  );
  const filePath = path.join(uploadDir, imageKey);

  if (!filePath.startsWith(uploadDir) || !fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Image not found." } });
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.sendFile(filePath);
});

app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

export default app;

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/authentication";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: batches });
});

export default router;

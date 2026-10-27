import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/authentication";

const router = Router();
const prisma = new PrismaClient();

router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ data: users });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ data: req.user });
});

export default router;

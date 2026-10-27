import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.inspection.deleteMany();
  await prisma.aIPrediction.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: "quality-engineer-demo",
      name: "Priya Singh",
      role: Role.QUALITY_ENGINEER,
    },
  });

  await prisma.user.create({
    data: {
      id: "production-supervisor-demo",
      name: "Alex Morgan",
      role: Role.PRODUCTION_SUPERVISOR,
    },
  });

  await prisma.batch.create({
    data: {
      batchCode: "BATCH-001",
      productName: "Steel Bracket — Model X200",
      productionLine: "Line 3",
    },
  });

  await prisma.batch.create({
    data: {
      batchCode: "BATCH-002",
      productName: "Aluminum Housing — V4",
      productionLine: "Line 1",
    },
  });

  console.log("Backend seeded successfully with demo users and batches.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

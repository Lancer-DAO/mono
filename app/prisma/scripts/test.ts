import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const allIndustries = await prisma.industry.findMany();
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

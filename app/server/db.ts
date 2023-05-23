import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [],
    // process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

prisma.$on<any>("query", (query: Prisma.QueryEvent) => {
  console.log("Query: " + query.query);
  console.log("Params: " + query.params);
  console.log("Duration: " + query.duration + "ms");
});

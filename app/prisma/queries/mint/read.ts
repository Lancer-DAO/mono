import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getAll = async (): Promise<Prisma.Mint[]> => {
  return prisma.mint.findMany();
};

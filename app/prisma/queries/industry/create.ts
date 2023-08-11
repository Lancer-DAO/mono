import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  name: string,
  description: string,
  color: string,
  icon: string
): Promise<Prisma.Industry> => {
  const industry = await prisma.industry.create({
    data: {
      name,
      description,
      color,
      icon,
    },
  });
  return industry;
};

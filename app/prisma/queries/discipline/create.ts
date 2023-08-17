import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  name: string,
  description: string,
  color: string,
  industryid: number
): Promise<Prisma.Discipline> => {
  const discipline = await prisma.discipline.create({
    data: {
      name,
      description,
      color,
      industryid,
    },
  });
  return discipline;
};

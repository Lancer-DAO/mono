import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const get = async (id: number) => {
  return await prisma.escrow.findUnique({
    where: {
      id: id,
    },
    include: {
      chain: true,
    },
  });
};

import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import { BountyState } from "@/src/types";

export const updateAmount = async (
  escrowId: number,
  amount: number
): Promise<Prisma.Escrow> => {
  return await prisma.escrow.update({
    where: {
      id: escrowId,
    },
    data: {
      amount,
    },
  });
};

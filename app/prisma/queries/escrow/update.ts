import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import { BountyState } from "@/types/";

export const updateAmount = async (
  escrowId: number,
  amount: number,
  paymentId?: string,
  achState?: string
): Promise<Prisma.Escrow> => {
  return await prisma.escrow.update({
    where: {
      id: escrowId,
    },
    data: {
      amount,
      paymentId,
      achState,
    },
  });
};

export const updateACHState = async (
  escrowId: number,
  achState: string
): Promise<Prisma.Escrow> => {
  return await prisma.escrow.update({
    where: {
      id: escrowId,
    },
    data: {
      achState: achState,
    },
  });
};

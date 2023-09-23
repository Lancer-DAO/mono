import { prisma } from "@/server/db";
import { PublicKey } from "@solana/web3.js";

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

export const getFromACHInfo = async (paymentId: string) => {
  // These two lines will fail if the amount or creator are not valid, which prevents sql injection attacks
  const escrow = prisma.escrow.findFirst({
    where: {
      paymentId: paymentId,
    },
  });

  return escrow;
};

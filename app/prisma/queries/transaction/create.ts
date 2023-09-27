import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  timestamp: string,
  signature: string,
  label: string,
  wallet: Prisma.Wallet,
  escrow: Prisma.Escrow
): Promise<Prisma.Transaction> => {
  const transaction = await prisma.transaction.create({
    data: {
      timestamp,
      signature,
      label,
      escrow: {
        connect: {
          id: escrow.id,
        },
      },
      wallets: {
        create: {
          walletid: wallet.id,
          relations: "[creator]",
        },
      },
    },
  });
  return transaction;
};

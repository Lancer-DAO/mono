import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const updateHasBeenInitialized = async (
  wallet: Prisma.Wallet
): Promise<Prisma.Wallet> => {
  return await prisma.wallet.update({
    where: {
      id: wallet.id,
    },
    data: {
      hasBeenInitialized: true,
    },
  });
};

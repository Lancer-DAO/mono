import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getOrCreate = async (
  user: Prisma.User,
  publicKey: string,
  isDefault?: boolean
): Promise<Prisma.Wallet> => {
  let wallet = await prisma.wallet.findUnique({
    where: {
      publicKey,
    },
  });
  if (!wallet) {
    try {
      wallet = await prisma.wallet.create({
        data: {
          publicKey,
          userid: user.id,
          isDefault,
        },
      });
    } catch (e) {
      console.log("e", e);
    }
  }
  return wallet;
};

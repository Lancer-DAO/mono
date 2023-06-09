import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getOrCreateWallet = async (
  user: Prisma.User,
  publicKey: string
): Promise<Prisma.Wallet> => {
  let wallet = await prisma.wallet.findUnique({
    where: {
      publicKey,
    },
  });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        publicKey,
        userid: user.id,
      },
    });
  }
  return wallet;
};

export const getWalletOrThrow = async (
  user: Prisma.User,
  publicKey: string
): Promise<Prisma.Wallet> => {
  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: {
      publicKey,
    },
  });
  if (wallet.userid !== user.id) {
    throw new Error("Wallet does not belong to specified user");
  }
  return wallet;
};

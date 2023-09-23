import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getOrThrow = async (
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

export const getWalletsForUser = async (
  user: Prisma.User
): Promise<Pick<Prisma.Wallet, "publicKey">[]> => {
  const wallet = await prisma.wallet.findMany({
    where: {
      userid: user.id,
    },
    select: {
      publicKey: true,
    },
  });
  return wallet;
};

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

export const getById = async (id: number) => {
  const wallet = await prisma.wallet.findFirst({ where: { id } });
  return wallet;
};

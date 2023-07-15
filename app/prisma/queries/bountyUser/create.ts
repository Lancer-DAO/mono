import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  bountyid: number,
  relations: string[],
  user: Prisma.User,
  wallet: Prisma.Wallet
): Promise<Prisma.BountyUser> => {
  return await prisma.bountyUser.create({
    data: {
      userid: user.id,
      bountyid,
      relations: relations.join(),
      walletid: wallet.id,
    },
  });
};

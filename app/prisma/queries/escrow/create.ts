import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  timestamp: string,
  escrowKey: string,
  user: Prisma.User,
  mint: number
): Promise<Prisma.Escrow> => {
  const escrow = await prisma.escrow.create({
    data: {
      timestamp: timestamp,
      publicKey: escrowKey,
      mint: {
        connect: {
          id: mint,
        },
      },
      users: {
        create: {
          userid: user.id,
          relations: "[creator]",
        },
      },
    },
  });
  return escrow;
};

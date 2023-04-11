import { getOrCreateChain } from "@/prisma/helpers";
import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const createEscrow = async (
  timestamp: string,
  escrowKey: string,
  chain: Prisma.Chain,
  user: Prisma.User
): Promise<Prisma.Escrow> => {
  console.log(timestamp, chain, user)
    const escrow = await prisma.escrow.create({
        data: {
          timestamp: timestamp,
          publicKey: escrowKey,
        chain: {
            connect: {
                id: chain.id
            }
        },
        users: {
            create: {
                userid: user.id,
                relations: "[creator]"
            }
        }
        }
      })
  return escrow;
};

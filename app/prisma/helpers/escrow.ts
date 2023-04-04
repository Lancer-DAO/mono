import { getOrCreateChain } from "@/prisma/helpers";
import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const createEscrow = async (
  timestamp: string,
  chain: Prisma.Chain,
  user: Prisma.User
): Promise<Prisma.Escrow> => {
    const escrow = await prisma.escrow.create({
        data: {
          timestamp: timestamp,
        chain: {
            connect: {
                uuid: chain.uuid
            }
        },
        users: {
            connect: {
                userUuid: user.uuid,
            }
        }
        }
      })
  return escrow;
};

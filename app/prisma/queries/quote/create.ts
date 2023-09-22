import { prisma } from "@/server/db";
import { QuestProgressState } from "@/types";
import * as Prisma from "@prisma/client";

export const create = async (
  userId: number,
  bountyId: number,
  title: string,
  description: string,
  estimatedTime: number,
  price: number,
  state: QuestProgressState,
  checkpoints: Prisma.Checkpoint[],
): Promise<Prisma.Quote> => {
  return await prisma.quote.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      bounty: {
        connect: {
          id: bountyId,
        },
      },
      title,
      description,
      estimatedTime,
      price,
      createdAt: Date.now().toString(),
      checkpoints: {
        connect: checkpoints.map((checkpoint) => {
          return {
            id: checkpoint.id,
          };
        }),
      },
      state,
    },
  });
}
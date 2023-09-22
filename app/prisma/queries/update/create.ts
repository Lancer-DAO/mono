import { prisma } from "@/server/db";
import { QuestProgressState } from "@/types";
import * as Prisma from "@prisma/client";

export const create = async (
  userId: number,
  bountyId: number,
  name: string,
  type: string,
  description: string,
  media: Prisma.Media[],
  links: string,
  state: QuestProgressState
): Promise<Prisma.QuestUpdate> => {
  return await prisma.questUpdate.create({
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
      name,
      type,
      description,
      createdAt: Date.now().toString(),
      media: {
        connect: media.map((med) => {
          return {
            id: med.id,
          };
        }),
      },
      links,
      state,
    },
  });
};

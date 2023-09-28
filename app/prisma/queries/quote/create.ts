import { prisma } from "@/server/db";
import { QuestProgressState } from "@/types";
import * as Prisma from "@prisma/client";
import dayjs from "dayjs";

export const create = async (
  userId: number,
  bountyId: number,
  title: string,
  description: string,
  estimatedTime: number,
  price: number,
  state: QuestProgressState
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
      createdAt: dayjs().toISOString(),
      state,
    },
  });
};

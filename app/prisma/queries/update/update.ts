import { prisma } from "@/server/db";
import { QuestProgressState } from "@/types";
import * as Prisma from "@prisma/client";

export const submitReview = async (
  id: number,
  review: string,
  state: QuestProgressState,
): Promise<Prisma.QuestUpdate> => {
  return await prisma.questUpdate.update({
    where: {
      id,
    },
    data: {
      review: review,
      state: state,
    },
  });
};
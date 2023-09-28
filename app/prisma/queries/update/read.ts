import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const read = async (id: number): Promise<Prisma.QuestUpdate> => {
  const update = await prisma.questUpdate.findUnique({
    where: {
      id,
    },
  });
  return update;
};

export const getUpdatesByBounty = async (
  id: number
): Promise<Prisma.QuestUpdate[]> => {
  const bounty = await prisma.bounty.findUnique({
    where: {
      id: id,
    },
    include: {
      updates: true,
    },
  });

  return bounty.updates;
};

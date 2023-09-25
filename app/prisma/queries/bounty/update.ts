import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import { BountyState } from "@/types/";

export const updateState = async (
  bountyId: number,
  state: BountyState
): Promise<Prisma.Bounty> => {
  return await prisma.bounty.update({
    where: {
      id: bountyId,
    },
    data: {
      state,
    },
  });
};

export const updateIsPrivate = async (
  bountyId: number,
  isPrivate: boolean,
) : Promise<Prisma.Bounty> => {
  return await prisma.bounty.update({
    where: {
      id: bountyId,
    },
    data: {
      isPrivate
    }
  })
}
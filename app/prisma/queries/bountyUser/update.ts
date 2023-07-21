import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const updateRelations = async (
  bountyid: number,
  relations: string[],
  user: Prisma.User
): Promise<Prisma.BountyUser> => {
  return await prisma.bountyUser.update({
    where: {
      userid_bountyid: {
        userid: user.id,
        bountyid: bountyid,
      },
    },
    data: {
      relations: relations.join(),
    },
  });
};

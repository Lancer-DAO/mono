import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  id: number,
  referrerId: number
): Promise<Prisma.ReferrerReferree> => {
  return await prisma.referrerReferree.findFirst({
    where: {
      referrerid: referrerId,
      referreeid: id,
    },
  });
};

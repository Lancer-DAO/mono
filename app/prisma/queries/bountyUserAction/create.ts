import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import dayjs from "dayjs";

export const create = async (
  bountyid: number,
  label: string,
  user: Prisma.User
): Promise<Prisma.BountyUserAction> => {
  return await prisma.bountyUserAction.create({
    data: {
      bountyid: bountyid,
      userid: user.id,
      type: label,
      timestamp: dayjs().toISOString(),
    },
  });
};

import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const get = async (userid: number, bountyid: number) => {
  return await prisma.bountyUser.findFirst({
    where: {
      userid: userid,
      bountyid: bountyid,
    },
  });
};

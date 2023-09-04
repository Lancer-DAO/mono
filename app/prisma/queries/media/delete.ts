import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const deleteMedia = async (
  id: number,
  userid: number
): Promise<void> => {
  await prisma.user.update({
    where: {
      id: userid,
    },
    data: {
      media: {
        delete: {
          id: id,
        },
      },
    },
  });
};

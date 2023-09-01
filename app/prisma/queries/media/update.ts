import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const deleteMedia = async (
  id: number,
): Promise<Prisma.Media> => {
  return await prisma.media.delete({
    where: {
      id: id,
    },
  });
};
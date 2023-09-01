import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const read = async (id: number): Promise<Prisma.Media> => {
  const media = await prisma.media.findUnique({
    where: {
      id,
    },
  });
  return media;
};

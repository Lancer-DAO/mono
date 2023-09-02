import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const update = async (
  id: number,
  imageUrl: string,
  title: string,
  description: string,
): Promise<Prisma.Media> => {
  return await prisma.media.update({
    where: {
      id: id,
    },
    data: {
      imageUrl,
      title,
      description,
    },
  });
};


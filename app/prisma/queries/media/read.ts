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

export const getMediaByUser = async (id: number): Promise<Prisma.Media[]> => {
  const user = await prisma.user.findUnique({
    where: {
      id: id, 
    },
    include: {
      media: true,
    },
  });
  return user.media;
} 
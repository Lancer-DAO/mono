import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types";
import * as Prisma from "@prisma/client";

export const create = async (
  imageUrl: string,
  title: string,
  description: string,
): Promise<Prisma.Media> => {
  const media = await prisma.media.create({
    data: {
      imageUrl,
      title,
      description,
    },
  });
  return media;
};

export const createWithUserId = async (
  id: number,
  imageUrl: string,
  title: string,
  description: string,
): Promise<Prisma.Media> => {
  const media = await prisma.media.create({
    data: {
      imageUrl,
      title,
      description,
      user: {
        connect: { id: id },
      }
    },
  });
  return media;
};

export type MediaType = UnwrapPromise<ReturnType<typeof create>>;

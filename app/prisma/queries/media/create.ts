import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types";
import * as Prisma from "@prisma/client";

export const create = async (
  imageUrl: string,
  description: string,
  title: string
): Promise<Prisma.Media> => {
  const media = await prisma.media.create({
    data: {
      imageUrl,
      description,
      title,
    },
  });
  return media;
};

export type MediaType = UnwrapPromise<ReturnType<typeof create>>;

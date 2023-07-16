import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getOrCreate = async (name: string): Promise<Prisma.Tag> => {
  let tag = await prisma.tag.findFirst({
    where: {
      name,
    },
  });
  if (!tag) {
    tag = await prisma.tag.create({
      data: {
        name,
      },
    });
  }
  return tag;
};

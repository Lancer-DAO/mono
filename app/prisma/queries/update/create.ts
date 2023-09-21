import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import dayjs from "dayjs";

export const create = async (
  bountyId: number,
  name: string,
  type: string,
  description: string,
  media: Prisma.Media[],
  links: string
): Promise<Prisma.Update> => {
  return await prisma.update.create({
    data: {
      bounty: {
        connect: {
          id: bountyId,
        },
      },
      name,
      type,
      description,
      createdAt: Date.now().toString(),
      media: {
        connect: media.map((med) => {
          return {
            id: med.id,
          };
        }),
      },
      links,
    },
  });
};

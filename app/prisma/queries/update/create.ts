
import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  bountyId: number,
  name: string,
  type: string,
  description: string,
  media: Prisma.Media[],
  links: string,
): Promise<Prisma.Update> => {
  return await prisma.update.create({
    data: {
      bounty: {
        connect: {
          id: bountyId,
        }
      },
      name,
      type,
      description,
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

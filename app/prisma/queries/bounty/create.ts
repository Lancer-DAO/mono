import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  createdAt: string,
  description: string,
  price: number,
  estimatedTime: number,
  isPrivate: boolean,
  title: string,
  escrow: Prisma.Escrow,
  tags: Prisma.Tag[],
  links: string[],
  media: string[],
  user: Prisma.User,
  wallet: Prisma.Wallet,
  industry: Prisma.Industry,
  discipline: Prisma.Discipline
): Promise<Prisma.Bounty> => {
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      price,
      estimatedTime,
      isPrivate,
      state: "new",
      title,
      escrow: {
        connect: {
          id: escrow.id,
        },
      },
      tags: {
        connect: tags.map((tag) => {
          return {
            id: tag.id,
          };
        }),
      },
      links: links.join(),
      media: media.join(),
      users: {
        create: {
          userid: user.id,
          relations: "[creator]",
          walletid: wallet.id,
        },
      },
    },
  });
  return bounty;
};

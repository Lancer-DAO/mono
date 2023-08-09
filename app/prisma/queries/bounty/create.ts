import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  createdAt: string,
  description: string,
  estimatedTime: number,
  isPrivate: boolean,
  title: string,
  category: string,
  escrow: Prisma.Escrow,
  tags: Prisma.Tag[],
  links: string[],
  media: string[],
  comment: string,
  user: Prisma.User,
  wallet: Prisma.Wallet
): Promise<Prisma.Bounty> => {
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      estimatedTime,
      isPrivate,
      state: "new",
      title,
      category,
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
      links,
      media,
      comment,
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

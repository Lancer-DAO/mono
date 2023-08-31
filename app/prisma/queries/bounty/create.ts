import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  createdAt: string,
  description: string,
  estimatedTime: number,
  isPrivate: boolean,
  title: string,
  escrow: Prisma.Escrow,
  tags: Prisma.Tag[],
  links: string[],
  media: string[],
  user: Prisma.User,
  wallet: Prisma.Wallet,
  industries: Prisma.Industry[],
  disciplines: Prisma.Discipline[],
  price?: number
): Promise<Prisma.Bounty> => {
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      price,
      estimatedTime,
      isPrivate,
      industries: {
        connect: industries.map((industry) => {
          return {
            id: industry.id,
          };
        }),
      },
      disciplines: {
        connect: disciplines.map((discipline) => {
          return {
            id: discipline.id,
          };
        }),
      },
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
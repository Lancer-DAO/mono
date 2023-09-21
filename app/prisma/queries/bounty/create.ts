import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  createdAt: string,
  description: string,
  estimatedTime: number,
  isPrivate: boolean,
  isTest: boolean,
  title: string,
  escrow: Prisma.Escrow,
  tags: Prisma.Tag[],
  links: string[],
  user: Prisma.User,
  wallet: Prisma.Wallet,
  industries: Prisma.Industry[],
  disciplines: Prisma.Discipline[],
  media: Prisma.Media[],
  price?: number
): Promise<Prisma.Bounty> => {
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      price,
      estimatedTime,
      isPrivate,
      isTest,
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

      media: {
        connect: media.map((med) => {
          return {
            id: med.id,
          };
        }),
      },
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

export const createExternal = async (
  createdAt: string,
  description: string,
  isPrivate: boolean,
  isExternal: boolean,
  title: string,
  links: string[],
  user: string,
  price?: number
): Promise<Prisma.Bounty> => {
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      price,
      isPrivate,
      isExternal,
      state: "new",
      title,
      links: links.join(),
      users: {
        create: {
          userid: process.env[user.toUpperCase() + '_USER_ID'],
          relations: "[creator]",
          walletid: process.env[user.toUpperCase() + '_WALLET_ID'],
        },
      },
    },
  });
  return bounty;
};
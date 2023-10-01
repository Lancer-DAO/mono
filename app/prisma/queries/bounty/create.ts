import { prisma } from "@/server/db";
import { BountyState } from "@/types";
import * as Prisma from "@prisma/client";
import * as queries from "../";

export const create = async (
  createdAt: string,
  description: string,
  isPrivate: boolean,
  isTest: boolean,
  title: string,
  escrow: Prisma.Escrow,
  tags: Prisma.Tag[],
  links: string[],
  user: Prisma.User,
  wallet: Prisma.Wallet,
  industries: Prisma.Industry[],
  media: Prisma.Media[]
): Promise<Prisma.Bounty> => {
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      isPrivate,
      isTest,
      industries: {
        connect: industries.map((industry) => {
          return {
            id: industry.id,
          };
        }),
      },
      state: BountyState.ACCEPTING_APPLICATIONS,
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
          relations: "creator",
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
  title: string,
  link: string,
  industries: Array<string>,
  userName: string,
  userPicture: string,
  price?: number
): Promise<Prisma.Bounty> => {
  const user = await queries.user.getOrCreateByName(userName, userPicture);
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      price,
      industries: {
        connect: industries.map((industry) => {
          return {
            name: industry,
          };
        }),
      },
      isPrivate: false,
      isExternal: true,
      state: BountyState.ACCEPTING_APPLICATIONS,
      title,
      links: link,
      users: {
        create: {
          userid: user.id,
          relations: "creator",
        },
      },
    },
  });
  return bounty;
};

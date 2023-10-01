import { prisma } from "@/server/db";
import { BOUNTY_USER_RELATIONSHIP } from "@/types";
import * as Prisma from "@prisma/client";

export const read = async (id: number): Promise<Prisma.Quote> => {
  const quote = await prisma.quote.findUnique({
    where: {
      id,
    },
  });

  return quote;
};

export const getQuotesByBounty = async (
  id: number
): Promise<Prisma.Quote[]> => {
  const bounty = await prisma.bounty.findUnique({
    where: {
      id: id,
    },
    include: {
      quotes: true,
    },
  });

  return bounty.quotes;
};

export const getHighestQuoteByBounty = async (
  bountyId: number
): Promise<number> => {
  const shortlistedUsers = await prisma.bountyUser.findMany({
    where: {
      bountyid: bountyId,
      relations: {
        contains: BOUNTY_USER_RELATIONSHIP.ShortlistedLancer,
      },
    },
  });

  const shortlistedIds = shortlistedUsers.map((slUser) => slUser.userid);

  const bounty = await prisma.bounty.findUnique({
    where: {
      id: bountyId,
    },
    include: {
      quotes: {
        where: {
          userid: {
            in: shortlistedIds,
          },
        },
        orderBy: {
          price: "desc",
        },
        take: 1,
      },
    },
  });

  return Number(bounty.quotes[0].price);
};

export const getQuoteByBountyAndUser = async (
  bountyId: number,
  userId: number
): Promise<Prisma.Quote> => {
  const quote = await prisma.quote.findFirst({
    where: {
      bountyid: bountyId,
      userid: userId,
    },
  });

  return quote;
};

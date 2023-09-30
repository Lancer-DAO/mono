import { prisma } from "@/server/db";
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

export const getHighestQuoteByBounty = async (id: number): Promise<number> => {
  const bounty = await prisma.bounty.findUnique({
    where: {
      id: id,
    },
    include: {
      quotes: {
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

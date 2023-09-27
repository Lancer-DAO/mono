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

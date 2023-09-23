import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const read = async (id: number): Promise<Prisma.Checkpoint> => {
  const checkpoint = await prisma.checkpoint.findUnique({
    where: {
      id,
    },
  });

  return checkpoint;
}

export const getCheckpointsByQuote = async (id: number): Promise<Prisma.Checkpoint[]> => {
  const quote = await prisma.quote.findUnique({
    where: {
      id: id,
    },
    include: {
      checkpoints: true,
    },
  });

  return quote.checkpoints;
}
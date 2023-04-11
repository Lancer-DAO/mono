import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getOrCreateChain = async (
  name: string,
  network: string,
): Promise<Prisma.Chain> => {
  let chain = await prisma.chain.findFirst({
    where: {
      name,
      network,
    },
  });
  if (!chain) {
    chain = await prisma.chain.create({
      data: {
        name,
        network
      },
    });
  }
  return chain;
};

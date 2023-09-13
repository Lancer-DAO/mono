import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import { UnwrapArray, UnwrapPromise } from "@/types";

export const getAll = async (): Promise<Prisma.Mint[]> => {
  return prisma.mint.findMany();
};

type MintsType = UnwrapPromise<ReturnType<typeof getAll>>;
export type MintType = UnwrapArray<MintsType>;

import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

const USER_INCLUDE = {
  wallets: true,
  referrees: {
    include: {
      referree: true,
    },
  },
  referrers: {
    include: {
      referrer: true,
    },
  },
};

export const getUser = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
    include: USER_INCLUDE,
  });
  return user;
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: USER_INCLUDE,
  });
  return user;
};

export const searchUserByName = async (
  query: string,
  includeCurrentUser?: boolean,
  currentUserId?: number
) => {
  const users = await prisma.user.findMany({
    where: {
      githubLogin: {
        contains: query,
      },
      id: includeCurrentUser ? undefined : { not: currentUserId },
    },
  });
  return users;
};

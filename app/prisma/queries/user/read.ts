import { prisma } from "@/server/db";

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

export const getByEmail = async (email: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
    include: USER_INCLUDE,
  });
  return user;
};

export const getById = async (id: number) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: USER_INCLUDE,
  });
  return user;
};

export const searchByName = async (
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
    include: {
      wallets: true,
    },
  });
  return users;
};

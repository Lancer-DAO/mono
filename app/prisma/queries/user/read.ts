import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types";

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
  industries: true,
};

const userQuery = async (email: string) =>
  prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
    include: USER_INCLUDE,
  });

const searchUser = async (
  query: string,
  includeCurrentUser?: boolean,
  currentUserId?: number
) => {
  return prisma.user.findMany({
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
};
export type UserType = UnwrapPromise<ReturnType<typeof userQuery>>;
export type UserSearchType = UnwrapPromise<ReturnType<typeof searchUser>>;

export const getByEmail = async (email: string) => {
  const user = await userQuery(email);
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

export const getWaitlistedUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          resume: {
            not: null,
          },
        },
        {
          OR: [
            {
              bio: {
                not: null,
              },
            },
            {
              website: {
                not: null,
              },
            },
            {
              twitter: {
                not: null,
              },
            },
            {
              github: {
                not: null,
              },
            },
            {
              media: {
                some: {},
              },
            },
          ],
        },
      ],
      hasBeenApproved: false,
    },
  });

  return users;
}
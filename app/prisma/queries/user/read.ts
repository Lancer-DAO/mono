import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types";
import { create, createNameOnly } from "./create";

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
  prisma.user.findUnique({
    where: {
      email,
    },
    include: USER_INCLUDE,
  });

const userQueryPreview = async (name: string) =>
  prisma.user.findFirstOrThrow({
    where: {
      name,
    },
    select: {
      name: true,
      id: true,
      picture: true,
    },
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

export const getOrCreateByEmail = async (
  email: string,
  sub: string,
  nickname,
  picture
) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
      include: USER_INCLUDE,
    });
    return user;
  } catch (e) {
    await create(email, sub, nickname, picture);
    const user = await userQuery(email);
    return user;
  }
};

export const getOrCreateByName = async (nickname, picture) => {
  try {
    const user = await userQueryPreview(nickname);
    return user;
  } catch (e) {
    await createNameOnly(nickname, picture);
    const user = await userQueryPreview(nickname);
    return user;
  }
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

export const getEmailsByIds = async (ids: number[]) => {
  const emails = await prisma.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      email: true,
    },
  });
  return emails;
};

export const searchByName = async (
  query: string,
  includeCurrentUser?: boolean,
  currentUserId?: number
) => {
  const users = await searchUser(query, includeCurrentUser, currentUserId);
  return users;
};

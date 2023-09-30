import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  email: string,
  googleId: string,
  name: string,
  picture?: string
): Promise<Prisma.User> => {
  return await prisma.user.create({
    data: {
      email,
      name,
      googleId,
      picture: picture,
      createdAt: Date.now().toString(),
    },
  });
};

export const createNameOnly = async (
  name: string,
  picture?: string
): Promise<Prisma.User> => {
  return await prisma.user.create({
    data: {
      name,
      picture: picture,
      createdAt: Date.now().toString(),
    },
  });
};

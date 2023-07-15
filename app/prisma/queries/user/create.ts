import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  email: string,
  githubId: string,
  githubLogin: string
): Promise<Prisma.User> => {
  return await prisma.user.create({
    data: {
      email,
      githubId,
      githubLogin,
      createdAt: Date.now().toString(),
    },
  });
};

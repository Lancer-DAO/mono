import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getUser = async (
  email: string
): Promise<Prisma.User> => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
          email,
        },
      });
      return user;
};

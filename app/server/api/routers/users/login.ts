import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";

export const login = protectedProcedure.mutation(async ({ ctx }) => {
  const { email, id, sub, nickname } = ctx.user;

  if (!id) {
    try {
      const maybeUser = await prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          wallets: true,
        },
      });
      if (maybeUser) {
        return maybeUser;
      }
      await prisma.user.create({
        data: {
          email,
          githubId: sub,
          githubLogin: nickname,
          createdAt: Date.now().toString(),
        },
      });

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          wallets: true,
        },
      });
      return user;
    } catch (e) {
      console.error(e);
    }
  } else {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        wallets: true,
      },
    });
    return user;
  }
});

import { prisma } from "@/server/db";
import { publicProcedure } from "../../trpc";

export const login = publicProcedure.mutation(async ({ ctx }) => {
  const { email, id, sub, nickname } = ctx.user;
  let user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      wallets: true,
    },
  });

  if (!user) {
    if (sub.includes("github")) {
      await prisma.user.create({
        data: {
          email,
          githubId: sub,
          githubLogin: nickname,
        },
      });
    }

    await prisma.user.create({
      data: {
        email,
      },
    });
  }
  user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      wallets: true,
    },
  });
  return user;
});

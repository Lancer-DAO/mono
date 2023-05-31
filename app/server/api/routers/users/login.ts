import { prisma } from "@/server/db";
import { publicProcedure } from "../../trpc";

export const login = publicProcedure.mutation(async ({ ctx }) => {
  const { email, id, sub, nickname } = ctx.user;

  if (!id) {
    try {
      console.log(email, id, sub, nickname);
      await prisma.user.create({
        data: {
          email,
          githubId: sub,
          githubLogin: nickname,
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

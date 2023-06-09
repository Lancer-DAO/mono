import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import * as helpers from "@/prisma/helpers";

export const login = protectedProcedure.mutation(async ({ ctx }) => {
  const { email, id, sub, nickname } = ctx.user;

  if (!id) {
    try {
      const maybeUser = await helpers.getUser(email);
      if (maybeUser) {
        return maybeUser;
      }
      await prisma.user.create({
        data: {
          email,
          githubId: sub,
          githubLogin: nickname,
        },
      });

      const user = await helpers.getUser(email);
      return user;
    } catch (e) {
      console.error(e);
    }
  } else {
    const user = await helpers.getUser(email);
    return user;
  }
});

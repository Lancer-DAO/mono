import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import * as helpers from "@/prisma/helpers";

export const login = protectedProcedure.mutation(async ({ ctx }) => {
  const { email, id, sub, nickname } = ctx.user;
  console.log("logging in", ctx.user);
  if (!id) {
    try {
      console.log("checking user exists");
      const maybeUser = await helpers.getUser(email);
      if (maybeUser) {
        return maybeUser;
      }
      console.log("creating user");
      await prisma.user.create({
        data: {
          email,
          githubId: sub,
          githubLogin: nickname,
        },
      });
      console.log("created user");
      const user = await helpers.getUser(email);
      console.log("got user");
      return user;
    } catch (e) {
      console.error(e);
    }
  } else {
    const user = await helpers.getUser(email);
    return user;
  }
});

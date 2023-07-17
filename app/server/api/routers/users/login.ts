import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const login = protectedProcedure.mutation(async ({ ctx }) => {
  const { email, id, sub, nickname } = ctx.user;
  if (!id) {
    try {
      const maybeUser = await queries.user.getByEmail(email);
      if (maybeUser) {
        return maybeUser;
      }
    } catch (e) {
      console.error(e);

      await queries.user.create(email, sub, nickname);
      const user = await queries.user.getByEmail(email);
      return user;
    }
  } else {
    const user = await queries.user.getByEmail(email);
    return user;
  }
});

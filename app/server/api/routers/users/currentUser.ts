import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import * as helpers from "@/prisma/helpers";

export const currentUser = protectedProcedure.mutation(async ({ ctx }) => {
  const user = await helpers.getUser(ctx.user.email);

  return { ...user, currentWallet: user.wallets[0] };
});

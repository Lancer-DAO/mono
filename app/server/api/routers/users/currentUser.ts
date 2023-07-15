import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const currentUser = protectedProcedure.mutation(async ({ ctx }) => {
  const user = await queries.user.getByEmail(ctx.user.email);

  return { ...user, currentWallet: user.wallets[0] };
});

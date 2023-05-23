import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";

export const currentUser = protectedProcedure.mutation(async ({ ctx }) => {
  const user = await prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
    include: {
      wallets: true,
    },
  });

  return { ...user, currentWallet: user.wallets[0] };
});

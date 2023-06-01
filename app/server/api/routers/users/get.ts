import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";

export const getUser = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ input: { id } }) => {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        wallets: true,
      },
    });

    return { ...user, currentWallet: user.wallets[0] };
  });

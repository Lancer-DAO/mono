import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";

export const registerProfileNFT = protectedProcedure
  .input(
    z.object({
      walletPublicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { walletPublicKey } }) => {
    const wallet = await prisma.wallet.findUnique({
      where: { publicKey: walletPublicKey },
    });
    const user = await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        hasProfileNFT: true,
        profileWalletId: wallet.id,
      },
    });

    return user;
  });

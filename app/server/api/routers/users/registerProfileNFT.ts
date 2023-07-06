import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as helpers from "@/prisma/helpers";

export const registerProfileNFT = protectedProcedure
  .input(
    z.object({
      walletPublicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { walletPublicKey } }) => {
    const { email } = ctx.user;
    const user = await helpers.getUser(email);

    const wallet = await helpers.getOrCreateWallet(user, walletPublicKey, true);

    const updatedUser = await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        hasProfileNFT: true,
        profileWalletId: wallet.id,
      },
    });

    return updatedUser;
  });

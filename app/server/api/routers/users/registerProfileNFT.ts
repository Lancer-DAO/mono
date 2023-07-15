import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const registerProfileNFT = protectedProcedure
  .input(
    z.object({
      walletPublicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { walletPublicKey } }) => {
    const { email } = ctx.user;
    const user = await queries.user.getByEmail(email);

    const wallet = await queries.wallet.getOrCreate(
      user,
      walletPublicKey,
      true
    );

    await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        hasProfileNFT: true,
        profileWalletId: wallet.id,
      },
    });

    const updatedUser = await queries.user.getByEmail(email);

    return { ...updatedUser, currentWallet: updatedUser.wallets[0] };
  });

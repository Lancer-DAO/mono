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
    const { email, id } = ctx.user;
    const user = await queries.user.getByEmail(email);

    const wallet = await queries.wallet.getOrCreate(
      user,
      walletPublicKey,
      true
    );
    if (!wallet.hasProfileNFT) {
      await queries.wallet.updateHasProfileNFT(wallet);
    }

    return wallet;
  });

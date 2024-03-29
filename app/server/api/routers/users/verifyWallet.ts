import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { UnwrapPromise } from "@/types";

export const verifyWallet = protectedProcedure
  .input(
    z.object({
      walletPublicKey: z.string(),
    })
  )
  .query(async ({ ctx, input: { walletPublicKey } }) => {
    const { email, id } = ctx.user;
    const user = await queries.user.getByEmail(email);

    const wallet = await queries.wallet.getOrCreate(user, walletPublicKey);

    return wallet;
  });

import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { UnwrapPromise } from "@/types";

export const getWallets = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .query(async ({ input: { id } }) => {
    const user = await queries.user.getById(id);
    const wallets = await queries.wallet.getWalletsForUser(user);

    return wallets;
  });

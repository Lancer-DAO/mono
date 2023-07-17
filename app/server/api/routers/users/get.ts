import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getUser = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ input: { id } }) => {
    const user = await queries.user.getById(id);

    return { ...user, currentWallet: user.wallets[0] };
  });

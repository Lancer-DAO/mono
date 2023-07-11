import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as helpers from "@/prisma/helpers";

export const getUser = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ input: { id } }) => {
    const user = await helpers.getUserById(id);

    return { ...user, currentWallet: user.wallets[0] };
  });

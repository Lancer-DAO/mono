import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const addReferrer = protectedProcedure
  .input(
    z.object({
      refferralTreasuryKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { refferralTreasuryKey } }) => {
    const { id } = ctx.user;
    const existingReferrer = await queries.referrerReferree.create(
      id,
      refferralTreasuryKey
    );

    const updatedUser = await queries.user.getById(id);
    return updatedUser;
  });

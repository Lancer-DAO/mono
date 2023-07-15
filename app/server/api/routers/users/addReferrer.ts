import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const addReferrer = protectedProcedure
  .input(
    z.object({
      walletId: z.number(),
      referrerId: z.number(),
      refferralTreasuryKey: z.string(),
    })
  )
  .mutation(
    async ({ ctx, input: { walletId, referrerId, refferralTreasuryKey } }) => {
      const { id } = ctx.user;
      const existingReferrer = await queries.referrerReferree.create(
        id,
        referrerId
      );

      if (existingReferrer) {
        throw new Error("You already have this referrer");
      }

      await queries.user.updateReferrer(
        id,
        referrerId,
        walletId,
        refferralTreasuryKey
      );

      const updatedUser = await queries.user.getById(id);
      return updatedUser;
    }
  );

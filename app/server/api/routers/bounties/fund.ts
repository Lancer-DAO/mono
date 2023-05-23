import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { BountyState } from "@/src/types";

export const fundBounty = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      escrowId: z.number(),
      amount: z.number(),
      mint: z.string(),
    })
  )
  .mutation(async ({ input: { bountyId, escrowId, amount, mint } }) => {
    const bounty = await prisma.bounty.update({
      where: {
        id: bountyId,
      },
      data: {
        state: BountyState.ACCEPTING_APPLICATIONS,
      },
    });

    const escrow = await prisma.escrow.update({
      where: {
        id: escrowId,
      },
      data: {
        amount,
        mint,
      },
    });

    return { bounty, escrow };
  });

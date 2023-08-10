import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { BountyState } from "@/types/";
import * as queries from "@/prisma/queries";
import { HostedHooksClient } from "../../webhooks";

export const fundBounty = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      escrowId: z.number(),
      amount: z.number(),
    })
  )
  .mutation(async ({ input: { bountyId, escrowId, amount } }) => {
    const bounty = await queries.bounty.updateState(
      bountyId,
      BountyState.ACCEPTING_APPLICATIONS
    );

    const escrow = await queries.escrow.updateAmount(escrowId, amount);

    const returnValue = { bounty, escrow };
    HostedHooksClient.sendWebhook(returnValue, "bounty.funded");

    return { bounty, escrow };
  });

import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { BountyState } from "@/types/";
import * as queries from "@/prisma/queries";
import { HostedHooksClient } from "../../webhooks";

export const updateBountyToPrivate = protectedProcedure
    .input(
        z.object({
            bountyId: z.number(),
            isPrivate: z.boolean(),
        })
    )
    .mutation(async ({ input : { bountyId, isPrivate }, ctx }) => {
        const bounty = await queries.bounty.updateIsPrivate(
            bountyId,
            isPrivate
        );

        // const escrow = await queries.escrow.updateAmount
        const returnValue = await queries.bounty.get(bountyId, ctx.user.id);
        HostedHooksClient.sendWebhook(returnValue, "bounty is now private")
    })
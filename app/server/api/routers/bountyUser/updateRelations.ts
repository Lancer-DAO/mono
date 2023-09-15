import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { BountyState } from "@/types/";
import { createGroupChannel } from "@/src/utils/sendbird";
import { HostedHooksClient } from "../../webhooks";

export const updateRelations = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      userId: z.number(),
      relations: z.array(z.string()),
    })
  )
  .mutation(async ({ ctx, input: { bountyId, userId, relations } }) => {
    const user = await queries.user.getById(userId);
    const { id: currentUserId } = ctx.user;

    await queries.bountyUser.updateRelations(bountyId, relations, user);

    const updatedBounty = await queries.bounty.get(bountyId, currentUserId);

    return updatedBounty;
  });

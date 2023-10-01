import * as queries from "@/prisma/queries";
import { BountyState, QuestProgressState } from "@/types";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const submitReview = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      review: z.string(),
      state: z.nativeEnum(QuestProgressState),
      bountyId: z.number(),
    })
  )
  .mutation(async ({ input: { id, review, state, bountyId } }) => {
    await queries.bounty.updateState(bountyId, BountyState.IN_PROGRESS);
    return await queries.update.submitReview(id, review, state);
  });

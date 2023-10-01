import * as queries from "@/prisma/queries";
import { QuestProgressState } from "@/types";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getQuestUpdatesLancer = protectedProcedure
  .input(
    z.optional(
      z.object({
        bountyids: z.array(z.number()),
      })
    )
  )
  .query(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const bountyids = input?.bountyids;

    return await queries.update.getQuestUpdatesLancer(userId, bountyids);
  });

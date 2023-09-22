import * as queries from "@/prisma/queries";
import { QuestProgressState } from "@/types";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getQuestUpdatesClient = protectedProcedure
  .input(
    z.optional(
      z.object({
        bountyids: z.array(z.number()),
      })
    )
  )
  .query(async ({ ctx, input }) => {
    const bountyids = input?.bountyids;

    const { id: userId } = ctx.user;

    return await queries.update.getQuestUpdatesClient(userId, bountyids);
  });

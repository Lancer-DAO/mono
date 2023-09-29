
import * as queries from "@/prisma/queries";
import { QuestProgressState } from "@/types";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const submitReview = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      review: z.string(),
      state: z.nativeEnum(QuestProgressState),
    })
  )
  .mutation(
    async ({ input: { id, review, state } }) => {
      return await queries.update.submitReview(id, review, state);
    }
  );

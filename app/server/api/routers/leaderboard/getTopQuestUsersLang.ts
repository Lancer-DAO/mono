import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";
import { z } from "zod";

export const getTopQuestUsersLang = protectedProcedure.input(
  z.object({
    language: z.string(),
    end_date: z.optional(z.date()),
  })
).mutation(async ({ input: { language, end_date } }) => {
  return await queries.leaderboard.getTopQuestUsersLang(language, end_date);
});

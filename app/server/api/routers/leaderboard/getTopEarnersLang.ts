import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";
import { z } from "zod";

export const getTopEarnersLang = protectedProcedure.input(
  z.object({
    language: z.string(),
    end_date: z.optional(z.date())
  })
).mutation(async ({ input: { language, end_date } }) => {
  return await queries.leaderboard.getTopEarnersLang(language, end_date)
});

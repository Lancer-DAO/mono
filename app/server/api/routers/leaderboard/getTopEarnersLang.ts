import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";
import { z } from "zod";

export const getTopEarnersLang = protectedProcedure.input(
  z.object({
    language: z.string(),
  })
).mutation(async ({ input: { language } }) => {
  return await queries.leaderboard.getTopEarnersLang(language)
});

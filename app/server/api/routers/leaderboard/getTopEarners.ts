import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";
import { z } from 'zod'

export const getTopEarners = protectedProcedure.input(
  z.object({
    end_date: z.optional(z.date())
  })
).mutation(async ({ input: { end_date } }) => {
  return await queries.leaderboard.getTopEarners(end_date)
});

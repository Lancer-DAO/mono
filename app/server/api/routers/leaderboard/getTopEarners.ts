import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const getTopEarners = protectedProcedure.mutation(async () => {
  return await queries.leaderboard.getTopEarners()
});

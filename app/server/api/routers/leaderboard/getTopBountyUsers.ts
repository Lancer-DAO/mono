import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const getTopBountyUsers = protectedProcedure.mutation(async () => {
  return await queries.leaderboard.getTopBountyUsers()
});

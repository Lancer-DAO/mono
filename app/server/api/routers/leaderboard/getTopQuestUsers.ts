import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const getTopQuestUsers = protectedProcedure.mutation(async () => {
  return await queries.leaderboard.getTopQuestUsers();
});

import { createTRPCRouter } from "../../trpc";
import { getTopQuestUsers } from "./getTopQuestUsers";
import { getTopEarners } from "./getTopEarners";

export const leaderboard = createTRPCRouter({
  getTopQuestUsers,
  getTopEarners,
});

import { createTRPCRouter } from "../../trpc";
import { getTopQuestUsersLang } from "./getTopQuestUsersLang";
import { getTopQuestUsers } from "./getTopQuestUsers";
import { getTopEarners } from "./getTopEarners";

export const leaderboard = createTRPCRouter({
  getTopQuestUsers,
  getTopEarners,
  getTopQuestUsersLang,
});

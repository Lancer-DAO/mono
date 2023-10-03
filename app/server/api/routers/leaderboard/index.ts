import { createTRPCRouter } from "../../trpc";
import { getTopQuestUsersLang } from "./getTopQuestUsersLang";
import { getTopQuestUsers } from "./getTopQuestUsers";
import { getTopEarners } from "./getTopEarners";
import { getTopEarnersLang } from "./getTopEarnersLang";

export const leaderboard = createTRPCRouter({
  getTopQuestUsers,
  getTopEarners,
  getTopEarnersLang,
  getTopQuestUsersLang,
});

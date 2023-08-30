import { createTRPCRouter } from "../../trpc";
import { getTopBountyUsers } from "./getTopBountyUsers";
import { getTopEarners } from "./getTopEarners";

export const leaderboard = createTRPCRouter({
    getTopBountyUsers,
    getTopEarners,
});

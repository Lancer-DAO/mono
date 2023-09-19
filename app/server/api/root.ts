import { bounties } from "@/server/api/routers/bounties/index";
import { bountyUsers } from "@/server/api/routers/bountyUser/index";
import { industries } from "@/server/api/routers/industries/index";
import { leaderboard } from '@/server/api/routers/leaderboard/index';
import { media } from "@/server/api/routers/media/index";
import { mints } from "@/server/api/routers/mint/index";
import { update } from "@/server/api/routers/update/index";
import { users } from "@/server/api/routers/users/index";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users,
  bounties,
  bountyUsers,
  industries,
  leaderboard,
  media,
  mints,
  update,
});

// export type definition of API
export type AppRouter = typeof appRouter;

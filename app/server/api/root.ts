import { createTRPCRouter } from "@/server/api/trpc";
import { users } from "@/server/api/routers/users/index";
import { bounties } from "@/server/api/routers/bounties/index";
import { bountyUsers } from "@/server/api/routers/bountyUser/index";
import { industries } from "@/server/api/routers/industries/index";
import { mints } from "@/server/api/routers/mint/index";
import { media } from "@/server/api/routers/media/index";

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
  mints,
  media,
});

// export type definition of API
export type AppRouter = typeof appRouter;

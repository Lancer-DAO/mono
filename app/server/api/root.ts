import { createTRPCRouter } from "@/server/api/trpc";
import { users } from "@/server/api/routers/users/index";
import { bounties } from "@/server/api/routers/bounties/index";
import { issues } from "@/server/api/routers/issues/index";
import { mints } from "@/server/api/routers/mint/index";
import { pullRequests } from "@/server/api/routers/pullRequests/index";
import { repository } from "@/server/api/routers/repository/index";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users,
  bounties,
  issues,
  mints,
  pullRequests,
  repository,
});

// export type definition of API
export type AppRouter = typeof appRouter;

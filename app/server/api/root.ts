import { createTRPCRouter } from "@/server/api/trpc";
import { users } from "@/server/api/routers/users/index";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users,
});

// export type definition of API
export type AppRouter = typeof appRouter;

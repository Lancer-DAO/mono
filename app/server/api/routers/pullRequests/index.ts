import { createTRPCRouter } from "../../trpc";

import { createPullRequest } from "./create";

export const pullRequests = createTRPCRouter({
  createPullRequest,
});

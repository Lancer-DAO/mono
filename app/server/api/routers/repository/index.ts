import { createTRPCRouter } from "../../trpc";

import { getRepoIssues } from "./issues";

export const repository = createTRPCRouter({
  getRepoIssues,
});

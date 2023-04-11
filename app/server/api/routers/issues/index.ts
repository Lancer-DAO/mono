
import { createTRPCRouter } from "../../trpc";

import { createIssue } from "./create";

export const issues = createTRPCRouter({
  createIssue,
});

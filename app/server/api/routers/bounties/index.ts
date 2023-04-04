
import { createTRPCRouter } from "../../trpc";

import { createBounty } from "./create";

export const bounties = createTRPCRouter({
  createBounty,
});

import { createTRPCRouter } from "../../trpc";

import { createBounty } from "./create";
import { getBounty } from "./get";
import { getAllBounties } from "./getAllBounties";
import { fundBounty } from "./fund";

export const bounties = createTRPCRouter({
  createBounty,
  getBounty,
  fundBounty,
  getAllBounties,
});

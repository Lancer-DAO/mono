
import { createTRPCRouter } from "../../trpc";

import { createBounty } from "./create";
import { getBounty } from "./get";
import {fundBounty} from "./fund"

export const bounties = createTRPCRouter({
  createBounty,
  getBounty,
  fundBounty
});

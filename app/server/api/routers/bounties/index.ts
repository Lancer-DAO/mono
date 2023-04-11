
import { createTRPCRouter } from "../../trpc";

import { createBounty } from "./create";
import { getBounty } from "./get";
import { getAllBounties } from "./getAllBounties";
import {fundBounty} from "./fund"
import { updateBountyUser } from "./updateBountyUser";

export const bounties = createTRPCRouter({
  createBounty,
  getBounty,
  fundBounty,
  updateBountyUser,
  getAllBounties
});

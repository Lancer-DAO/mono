import { createTRPCRouter } from "../../trpc";

import { createBounty } from "./create";
import { getBounty } from "./get";
import { getAllBounties } from "./getAllBounties";
import { fundBounty } from "./fund";
import { deleteMedia } from "./deleteMedia";

import { tags } from "./tags";

export const bounties = createTRPCRouter({
  createBounty,
  getBounty,
  fundBounty,
  getAllBounties,
  deleteMedia,
  tags,
});

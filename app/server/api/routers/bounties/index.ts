import { createTRPCRouter } from "../../trpc";

import { createBounty } from "./create";
import { getBounty } from "./get";
import { fundBounty } from "./fund";
import { getAllBounties } from "./getAllBounties";
import { getCompletedBountiesForUser } from "./getCompletedBountiesForUser";
import { deleteMedia } from "./deleteMedia";
import { tags } from "./tags";
import { updateBountyToPrivate } from "./updateIsPrivate";

export const bounties = createTRPCRouter({
  createBounty,
  getBounty,
  fundBounty,
  getAllBounties,
  getCompletedBountiesForUser,
  deleteMedia,
  updateBountyToPrivate,
  tags,
});

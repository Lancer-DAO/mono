import { createTRPCRouter } from "../../trpc";
import { createUpdate } from "./createUpdate";
import { getNewUpdateByBounty } from "./getNewUpdateByBounty";
import { getUpdate } from "./getUpdate";
import { getUpdatesByBounty } from "./getUpdatesByBounty";
import { getQuestUpdatesClient } from "./getUpdatesForClient";
import { getQuestUpdatesLancer } from "./getUpdatesForLancer";
import { submitReview } from "./submitReview";

export const update = createTRPCRouter({
  getUpdate,
  getUpdatesByBounty,
  getNewUpdateByBounty,
  createUpdate,
  getQuestUpdatesClient,
  getQuestUpdatesLancer,
  submitReview,
});

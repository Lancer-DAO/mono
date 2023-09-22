import { createTRPCRouter } from "../../trpc";
import { createUpdate } from "./createUpdate";
import { getUpdate } from "./getUpdate";
import { getUpdatesByBounty } from "./getUpdatesByBounty";
import { getQuestUpdatesClient } from "./getUpdatesForClient";
import { getQuestUpdatesLancer } from "./getUpdatesForLancer";

export const update = createTRPCRouter({
  getUpdate,
  getUpdatesByBounty,
  createUpdate,
  getQuestUpdatesClient,
  getQuestUpdatesLancer,
});

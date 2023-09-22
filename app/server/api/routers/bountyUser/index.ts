import { createTRPCRouter } from "../../trpc";

import { getBountyUpdatesCreator } from "./getUpdatesCreator";
import { getBountyUpdatesLancer } from "./getUpdatesLancer";
import { getCancelVotesLancer } from "./getCancelVotesLancer";
import { update } from "./update";

export const bountyUsers = createTRPCRouter({
  getBountyUpdatesCreator,
  getBountyUpdatesLancer,
  getCancelVotesLancer,
  update,
});

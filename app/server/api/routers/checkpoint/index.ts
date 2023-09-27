import { createTRPCRouter } from "../../trpc";
import { getCheckpointsByBounty } from "./getCheckpointsByBounty";

export const checkpoint = createTRPCRouter({
  getCheckpointsByBounty,
});
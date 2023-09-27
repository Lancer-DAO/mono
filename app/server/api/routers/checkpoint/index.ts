import { createTRPCRouter } from "../../trpc";
import { getCheckpointsByQuote } from "./getCheckpointsByBounty";

export const checkpoint = createTRPCRouter({
  getCheckpointsByQuote,
});
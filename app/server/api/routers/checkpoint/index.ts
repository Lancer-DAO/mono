import { createTRPCRouter } from "../../trpc";
import { getCheckpointsByQuote } from "./getCheckpointsByQuote";

export const checkpoint = createTRPCRouter({
  getCheckpointsByQuote,
});

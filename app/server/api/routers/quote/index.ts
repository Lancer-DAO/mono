import { createTRPCRouter } from "../../trpc";
import { createQuote } from "./createQuote";
import { getQuote } from "./getQuote";
import { getQuotesByBounty } from "./getQuoteByBounty";

export const quote = createTRPCRouter({
  createQuote,
  getQuote,
  getQuotesByBounty,
});
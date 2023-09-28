import { createTRPCRouter } from "../../trpc";
import { createQuote } from "./createQuote";
import { getQuote } from "./getQuote";
import { getQuotesByBounty } from "./getQuoteByBounty";
import { getQuoteByBountyAndUser } from "./getQuoteByBountyAndUser";

export const quote = createTRPCRouter({
  createQuote,
  getQuote,
  getQuotesByBounty,
  getQuoteByBountyAndUser,
});
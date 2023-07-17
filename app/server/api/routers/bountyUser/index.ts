import { createTRPCRouter } from "../../trpc";

import { update } from "./update";

export const bountyUsers = createTRPCRouter({
  update,
});

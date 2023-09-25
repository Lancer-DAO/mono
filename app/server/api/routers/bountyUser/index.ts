import { createTRPCRouter } from "../../trpc";

import { update } from "./update";
import { updateRelations } from "./updateRelations";

export const bountyUsers = createTRPCRouter({
  update,
  updateRelations
});

import { createTRPCRouter } from "../../trpc";
import { createUpdate } from "./createUpdate";
import { getUpdate } from "./getUpdate";
import { getUpdatesByBounty } from "./getUpdatesByBounty";

export const update = createTRPCRouter({
  getUpdate,
  getUpdatesByBounty,
  createUpdate,
})
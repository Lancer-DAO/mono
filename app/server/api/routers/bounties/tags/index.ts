import { createTRPCRouter } from "../../../trpc";

import { get } from "./get";

export const tags = createTRPCRouter({
  get,
});

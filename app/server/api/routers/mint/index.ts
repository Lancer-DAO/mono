import { createTRPCRouter } from "../../trpc";

import { getMints } from "./getAll";

export const mints = createTRPCRouter({
  getMints,
});

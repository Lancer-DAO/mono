import { createTRPCRouter } from "../../trpc";

import { login } from "./login";

export const users = createTRPCRouter({
  login,
});

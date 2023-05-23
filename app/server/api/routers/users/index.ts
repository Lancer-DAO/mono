import { createTRPCRouter } from "../../trpc";

import { login } from "./login";
import { currentUser } from "./currentUser";
import { getRepos } from "./repos";

export const users = createTRPCRouter({
  login,
  currentUser,
  getRepos,
});

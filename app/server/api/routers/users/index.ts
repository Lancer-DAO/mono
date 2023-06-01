import { createTRPCRouter } from "../../trpc";

import { login } from "./login";
import { currentUser } from "./currentUser";
import { registerProfileNFT } from "./registerProfileNFT";
import { getUser } from "./get";

export const users = createTRPCRouter({
  login,
  currentUser,
  registerProfileNFT,
  getUser,
});

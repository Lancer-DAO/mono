import { createTRPCRouter } from "../../trpc";

import { login } from "./login";
import { currentUser } from "./currentUser";
import { registerProfileNFT } from "./registerProfileNFT";

export const users = createTRPCRouter({
  login,
  currentUser,
  registerProfileNFT,
});

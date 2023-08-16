import { createTRPCRouter } from "../../trpc";

import { login } from "./login";
import { currentUser } from "./currentUser";
import { registerProfileNFT } from "./registerProfileNFT";
import { getUser } from "./get";
import { search } from "./search";
import { addReferrer } from "./addReferrer";
import { maybeInitAccount } from "./maybeInitAccount";
import { verifyWallet } from "./verifyWallet";

export const users = createTRPCRouter({
  login,
  currentUser,
  registerProfileNFT,
  getUser,
  search,
  addReferrer,
  maybeInitAccount,
  verifyWallet,
});

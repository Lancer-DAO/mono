import { createTRPCRouter } from "../../trpc";

import { addOnboardingInformation } from "./addOnboardingInformation";
import { login } from "./login";
import { currentUser } from "./currentUser";
import { registerProfileNFT } from "./registerProfileNFT";
import { getUser } from "./get";
import { search } from "./search";
import { addReferrer } from "./addReferrer";
import { maybeInitAccount } from "./maybeInitAccount";
import { verifyWallet } from "./verifyWallet";
import { updateLinks } from "./updateLinks";
import { updateResume } from "./updateResume";
import { deleteResume } from "./deleteResume";

export const users = createTRPCRouter({
  addOnboardingInformation,
  login,
  currentUser,
  registerProfileNFT,
  getUser,
  search,
  addReferrer,
  maybeInitAccount,
  verifyWallet,
  updateLinks,
  updateResume,
  deleteResume,
});

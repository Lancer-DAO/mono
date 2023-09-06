import { createTRPCRouter } from "../../trpc";

import { addOnboardingInformation } from "./addOnboardingInformation";
import { addReferrer } from "./addReferrer";
import { approveUser } from "./approveUser";
import { currentUser } from "./currentUser";
import { deleteResume } from "./deleteResume";
import { getUser } from "./get";
import { getWaitlistedUsers } from "./getWaitlistedUsers";
import { login } from "./login";
import { maybeInitAccount } from "./maybeInitAccount";
import { registerProfileNFT } from "./registerProfileNFT";
import { search } from "./search";
import { updateBio } from "./updateBio";
import { updateIndustry } from "./updateIndustry";
import { updateLinks } from "./updateLinks";
import { updateName } from "./updateName";
import { updateResume } from "./updateResume";
import { verifyWallet } from "./verifyWallet";

export const users = createTRPCRouter({
  addOnboardingInformation,
  approveUser,
  login,
  currentUser,
  registerProfileNFT,
  getUser,
  getWaitlistedUsers,
  search,
  addReferrer,
  maybeInitAccount,
  verifyWallet,
  updateIndustry,
  updateLinks,
  updateName,
  updateBio,
  updateResume,
  deleteResume,
});

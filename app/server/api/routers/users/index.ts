import { createTRPCRouter } from "../../trpc";

import { addOnboardingInformation } from "./addOnboardingInformation";
import { addReferrer } from "./addReferrer";
import { approveUser } from "./approveUser";
import { currentUser } from "./currentUser";
import { deleteResume } from "./deleteResume";
import { getUser } from "./get";
import { getWallets } from "./getWallets";
import { login } from "./login";
import { maybeInitAccount } from "./maybeInitAccount";
import { registerProfileNFT } from "./registerProfileNFT";
import { registerOnboardingBadge } from "./registerOnboardingBadge";
import { search } from "./search";
import { updateBio } from "./updateBio";
import { updateCompanyDescription } from "./updateCompanyDescription";
import { updateHasCompletedProfile } from "./updateHasCompletedProfile";
import { updateIndustry } from "./updateIndustry";
import { updateLinks } from "./updateLinks";
import { updateName } from "./updateName";
import { updateResume } from "./updateResume";
import { verifyWallet } from "./verifyWallet";

export const users = createTRPCRouter({
  addOnboardingInformation,
  addReferrer,
  approveUser,
  currentUser,
  deleteResume,
  getUser,
  getWallets,
  login,
  maybeInitAccount,
  registerOnboardingBadge,
  registerProfileNFT,
  search,
  updateBio,
  updateCompanyDescription,
  updateHasCompletedProfile,
  updateIndustry,
  updateLinks,
  updateName,
  updateResume,
  verifyWallet,
});

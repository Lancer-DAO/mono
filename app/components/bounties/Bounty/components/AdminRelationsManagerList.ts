import { useUserWallet } from "@/src/providers/userWalletProvider";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import {
  addSubmitterFFA,
  removeSubmitterFFA,
  addSubmitterFFAOld,
} from "@/escrow/adapters";
import { Button, ContributorInfo, MultiSelectDropdown } from "@/components";
import { Check, X } from "react-feather";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { useReferral } from "@/src/providers/referralProvider";
import { BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE } from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { BountyUserType } from "@/prisma/queries/bounty";
import { updateList } from "@/src/utils";
import { useState } from "react";

export type AdminRelationsManagerListType = "approved" | "requested";
interface AdminRelationsManagerListProps {
  user: BountyUserType;
  type: AdminRelationsManagerListType;
}

export const AdminRelationsManagerList: React.FC<AdminRelationsManagerListProps> = ({
    user,
}: AdminRelationsManagerListProps) => {

    return (
        <div className="flex flex-wrap gap-3 pt-4" id="bounty-actions">
            {currentBounty.all.map((user) => <AdminRelationsManagerSection submitter={user} />}
        </div>
    )
}
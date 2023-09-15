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

export type AdminRelationsManagerSectionType = "approved" | "requested";
interface AdminRelationsManagerSectionProps {
  user: BountyUserType;
//   type: AdminRelationsManagerSectionType;
}

export const TABLE_BOUNTY_STATES = Object.values(BOUNTY_USER_RELATIONSHIP).slice(2);


export const AdminRelationsManagerSection: React.FC<AdminRelationsManagerSectionProps> = ({
    user,
}: AdminRelationsManagerSectionProps) => {
    const { currentWallet, provider, program, currentUser } = useUserWallet();
    const { currentBounty, setCurrentBounty } = useBounty();
    const { currentTutorialState, setCurrentTutorialState } = useTutorial();
    const { mutateAsync } = api.bountyUsers.updateRelations.useMutation();
    const { getRemainingAccounts, getSubmitterReferrer } = useReferral();
    const [newRelations, setNewRelations] = useState(user.relations);
    // const {currentBounty} = useBounty()
    
    if (!currentBounty) return null;
    const disabled = !(Number(currentBounty.escrow.amount) > 0);
  
    const handleRelationUpdate = async () => {
        const newRelations = [BOUNTY_USER_RELATIONSHIP.]

        await mutateAsync({
            bountyId: currentBounty?.id,
            userId: user.userid,
            relations: newRela
        })
    };
  
    return (
        <div className="submitter-section flex items-center">
          <ContributorInfo user={user.userid} />
          <div className="items-center flex justify-center">
            {type === "approved" ? (
              <div className="empty-submitter-cell"></div>
            ) : (
            <MultiSelectDropdown
            options={RELATIONS.map((state) => {
                return {
                value: state,
                label: state
                    .split("_")
                    .map((_state) => capitalize(_state))
                    .join(" "),
                };
            })}
            selected={user.relations.map((state) => {
                return {
                value: state,
                label: state
                    .split("_")
                    .map((_state) => capitalize(_state))
                    .join(" "),
                };
            })}
            onChange={(options)=>{
                setNewRelations(options.map((option) => option.value) as string[])
            }
            />
      
                <Button
                    onClick={async () => {
                    await handleRelationUpdate();
                    }}
                    id={`submitter-section-approve-${type}-${index}`}
                    className="h-12"
                    disabledText="Fund Quest To Manage Applicants"
                    disabled={disabled}
                >
                    <Check
                    color={disabled ? "gray" : "#14bb88"}
                    width="20px"
                    height="20px"
                    />
                </Button>
                )}
                <Button
                onClick={async () => {
                    await handleRelationUpdate();
                }}
                id={`submitter-section-deny-${type}-${index}`}
                className="h-12"
                disabled={!(Number(currentBounty.escrow.amount) > 0)}
                disabledText="Fund Quest To Manage Applicants"
                >
                <X color={disabled ? "gray" : "red"} width="20px" height="20px" />
                </Button>
          </div>
        </div>
      );
    
};
  

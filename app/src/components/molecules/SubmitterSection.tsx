import axios from "axios";
import { useLancer } from "@/src/providers/lancerProvider";
import {
  Contributor,
  BOUNTY_USER_RELATIONSHIP,
  User,
  BountyState,
} from "@/src/types";
import { addSubmitterFFA, removeSubmitterFFA } from "@/escrow/adapters";
import { ContributorInfo } from "@/src/components/";
import { Check, X } from "react-feather";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { useReferral } from "@/src/providers/referralProvider";

export type SubmitterSectionType = "approved" | "requested";
interface SubmitterSectionProps {
  submitter: Contributor;
  type: SubmitterSectionType;
}

const SubmitterSection: React.FC<SubmitterSectionProps> = ({
  submitter,
  type,
}: SubmitterSectionProps) => {
  const {
    currentBounty,
    currentWallet,
    provider,
    program,
    currentUser,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const { referrer, getRemainingAccounts } = useReferral();

  const handleSubmitter = async (cancel?: boolean) => {
    switch (type) {
      case "approved":
        {
          try {
            const signature = await removeSubmitterFFA(
              new PublicKey(submitter.publicKey),
              currentBounty.escrow,
              currentWallet,
              program,
              provider
            );
            submitter.relations.push(
              BOUNTY_USER_RELATIONSHIP.RequestedSubmitter
            );
            const index = currentBounty.currentUserRelationsList.indexOf(
              BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
            );

            if (index !== -1) {
              currentBounty.currentUserRelationsList.splice(index, 1);
            }
            const { updatedBounty } = await mutateAsync({
              bountyId: currentBounty.id,
              userId: submitter.userid,
              currentUserId: currentUser.id,
              relations: currentBounty.currentUserRelationsList,

              publicKey: currentWallet.publicKey.toString(),
              escrowId: currentBounty.escrowid,
              signature: "test",
              label: "remove-submitter",
            });

            setCurrentBounty(updatedBounty);
          } catch (e) {
            console.error(e);
          }
        }
        break;
      case "requested":
        {
          // try {
          if (cancel) {
            const { updatedBounty } = await mutateAsync({
              bountyId: currentBounty.id,
              currentUserId: currentUser.id,
              userId: submitter.userid,
              relations: [BOUNTY_USER_RELATIONSHIP.DeniedRequester],
              publicKey: currentWallet.publicKey.toString(),
              escrowId: currentBounty.escrowid,
              signature: "n/a",
              label: "deny-submitter",
            });
            setCurrentBounty(updatedBounty);
          } else {
            console.log(submitter);
            const remainingAccounts = await getRemainingAccounts(
              new PublicKey(submitter.publicKey)
            );
            debugger;

            console.log("ici?", submitter, remainingAccounts);
            const signature = await addSubmitterFFA(
              new PublicKey(submitter.publicKey),
              currentBounty.escrow,
              currentWallet,
              referrer,
              remainingAccounts,
              program,
              provider
            );
            const { updatedBounty } = await mutateAsync({
              bountyId: currentBounty.id,
              userId: submitter.userid,
              currentUserId: currentUser.id,
              relations: [BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter],
              state: BountyState.IN_PROGRESS,
              publicKey: currentWallet.publicKey.toString(),
              escrowId: currentBounty.escrowid,
              signature,
              label: "add-approved-submitter",
            });

            setCurrentBounty(updatedBounty);
          }
          // } catch (e) {
          //   console.error(e);
          // }
        }
        break;
    }
  };

  return (
    <div className="submitter-section">
      <ContributorInfo user={submitter.user} />

      {type === "approved" ? (
        <div className="empty-submitter-cell"></div>
      ) : (
        <button onClick={() => handleSubmitter()}>
          <Check color="#1488bb" width="20px" height="20px" />
        </button>
      )}
      <button onClick={() => handleSubmitter(true)}>
        <X color="red" width="20px" height="20px" />
      </button>
    </div>
  );
};

export default SubmitterSection;

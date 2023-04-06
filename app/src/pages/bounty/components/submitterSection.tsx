import { USER_ISSUE_RELATION_ROUTE } from "@/constants";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useLancer } from "@/src/providers/lancerProvider";
import {
  Contributor,
  BOUNTY_USER_RELATIONSHIP,
  User,
  IssueState,
} from "@/src/types";
import { addSubmitterFFA, removeSubmitterFFA } from "@/escrow/adapters";
import { ContributorInfo } from "@/src/components/ContributorInfo";
import { Check, X } from "react-feather";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";

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
    wallet,
    provider,
    program,
    currentUser,
    setIssue,
    setCurrentBounty,
    setCurrentUser,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();

  const handleSubmitter = async (cancel?: boolean) => {
    switch (type) {
      case "approved":
        {
          try {
            const signature = await removeSubmitterFFA(
              new PublicKey(submitter.publicKey),
              currentBounty.escrow,
              wallet,
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
              relations: currentBounty.currentUserRelationsList,
              walletId: currentUser.currentWallet.id,
              escrowId: currentBounty.escrowid,
              signature,
              label: "remove-submitter",
            });

            setCurrentBounty(updatedBounty);
            setCurrentUser({
              ...currentUser,
              relations: currentBounty.currentUserRelationsList,
            });
          } catch (e) {
            console.error(e);
          }
        }
        break;
      case "requested":
        {
          try {
            if (cancel) {
              const { updatedBounty } = await mutateAsync({
                bountyId: currentBounty.id,
                userId: submitter.userid,
                relations: [BOUNTY_USER_RELATIONSHIP.DeniedRequester],
              });
              setCurrentBounty(updatedBounty);

              setCurrentUser({
                ...currentUser,
                relations: currentBounty.currentUserRelationsList,
              });
            } else {
              const signature = await addSubmitterFFA(
                new PublicKey(submitter.publicKey),
                currentBounty.escrow,
                wallet,
                program,
                provider
              );
              const { updatedBounty } = await mutateAsync({
                bountyId: currentBounty.id,
                userId: currentUser.id,
                relations: currentBounty.currentUserRelationsList,
                state: IssueState.IN_PROGRESS,
                walletId: currentUser.currentWallet.id,
                escrowId: currentBounty.escrowid,
                signature,
                label: "add-approved-submitter",
              });

              setCurrentBounty(updatedBounty);
              setCurrentUser({
                ...currentUser,
                relations: currentBounty.currentUserRelationsList,
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
        break;
    }
  };

  return (
    <div className="submitter-section">
      <ContributorInfo user={submitter} />

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

import { useUserWallet } from "@/src/providers/userWalletProvider";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import {
  addSubmitterFFA,
  removeSubmitterFFA,
  addSubmitterFFAOld,
} from "@/escrow/adapters";
import { Button, ContributorInfo } from "@/components";
import { Check, X } from "react-feather";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { useReferral } from "@/src/providers/referralProvider";
import { BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE } from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { BountyUserType } from "@/prisma/queries/bounty";
import { updateList } from "@/src/utils";

export type SubmitterSectionType = "approved" | "requested";
interface SubmitterSectionProps {
  submitter: BountyUserType;
  type: SubmitterSectionType;
  index?: number;
}

export const SubmitterSection: React.FC<SubmitterSectionProps> = ({
  submitter,
  type,
  index,
}: SubmitterSectionProps) => {
  const { currentWallet, provider, program, currentUser } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const { getRemainingAccounts, getSubmitterReferrer } = useReferral();

  if (!currentBounty) return null;
  const disabled = !(Number(currentBounty.escrow.amount) > 0);

  const handleSubmitter = async (cancel?: boolean) => {
    switch (type) {
      case "approved":
        {
          try {
            await removeSubmitterFFA(
              new PublicKey(submitter.publicKey),
              currentBounty?.escrow,
              currentWallet,
              program,
              provider
            );
            const newRelations = [BOUNTY_USER_RELATIONSHIP.DeniedLancer];

            const updatedBounty = await mutateAsync({
              bountyId: currentBounty?.id,
              userId: submitter.userid,
              currentUserId: currentUser.id,
              relations: newRelations,

              publicKey: submitter.publicKey.toString(),
              escrowId: currentBounty?.escrowid,
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
          try {
            if (cancel) {
              const newRelations = [BOUNTY_USER_RELATIONSHIP.DeniedLancer];

              const updatedBounty = await mutateAsync({
                bountyId: currentBounty?.id,
                currentUserId: currentUser.id,
                userId: submitter.userid,
                relations: newRelations,
                publicKey: submitter.publicKey,
                escrowId: currentBounty?.escrowid,
                signature: "n/a",
                label: "deny-submitter",
              });
              setCurrentBounty(updatedBounty);
            } else {
              const submitterWallet = new PublicKey(submitter.publicKey);
              const remainingAccounts = await getRemainingAccounts(
                submitterWallet,
                new PublicKey(currentBounty?.escrow.mint.publicKey)
              );
              if (
                currentTutorialState?.title ===
                  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 4
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  isRunning: false,
                });
              }
              const signature = await addSubmitterFFA(
                submitterWallet,
                currentBounty?.escrow,
                currentWallet,
                await getSubmitterReferrer(
                  submitterWallet,
                  new PublicKey(currentBounty?.escrow.mint.publicKey)
                ),
                remainingAccounts,
                program,
                provider
              );
              const newRelations = updateList(
                submitter.userid === currentUser.id
                  ? currentBounty?.currentUserRelationsList
                  : [],
                [BOUNTY_USER_RELATIONSHIP.RequestedLancer],
                [BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter]
              );
              const updatedBounty = await mutateAsync({
                bountyId: currentBounty?.id,
                userId: submitter.userid,
                currentUserId: currentUser.id,
                relations: newRelations,
                state: BountyState.IN_PROGRESS,
                publicKey: submitter.publicKey,
                escrowId: currentBounty?.escrowid,
                signature,
                label: "add-approved-submitter",
              });

              setCurrentBounty(updatedBounty);
              if (
                currentTutorialState?.title ===
                  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 4
              ) {
                setTimeout(() => {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    isRunning: true,
                    currentStep: 5,
                  });
                }, 100);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
        break;
    }
  };

  return (
    <div className="submitter-section flex items-center">
      <ContributorInfo user={submitter.user} />
      <div className="items-center flex justify-center">
        {type === "approved" ? (
          <div className="empty-submitter-cell"></div>
        ) : (
          <Button
            onClick={async () => {
              await handleSubmitter();
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
            await handleSubmitter(true);
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

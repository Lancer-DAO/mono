import { submitRequestFFA } from "@/escrow/adapters";
import { BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { updateList } from "@/src/utils";
import { QuestActionsButton } from ".";
import { useState } from "react";
import toast from "react-hot-toast";

export const SubmitRequest = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const [isLoading, setIsLoading] = useState(false);

  if (
    !currentBounty ||
    !(
      (currentBounty.isApprovedSubmitter && !currentBounty.currentSubmitter) ||
      currentBounty.isChangesRequestedSubmitter
    )
  )
    return null;

  if (currentBounty.isCurrentSubmitter)
    return (
      <QuestActionsButton
        type="neutral"
        text="Request Submitted"
        disabled={true}
      />
    );

  const onClick = async () => {
    setIsLoading(true);
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }
    const signature = await submitRequestFFA(
      new PublicKey(currentBounty.creator.publicKey),
      currentWallet.publicKey,
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    const newRelations = updateList(
      currentBounty.currentUserRelationsList,
      [
        BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter,
        BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter,
      ],
      [BOUNTY_USER_RELATIONSHIP.CurrentSubmitter]
    );

    const updatedBounty = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: newRelations,
      state: BountyState.AWAITING_REVIEW,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "submission",
    });

    setCurrentBounty(updatedBounty);
    setIsLoading(false);
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: true,
        currentStep: 2,
      });
    }
    toast.success("Successfully submitted request");
  };

  return (
    <QuestActionsButton
      type="green"
      text={isLoading ? "Loading ..." : "Submit"}
      onClick={onClick}
      isLoading={isLoading}
    />
  );
};

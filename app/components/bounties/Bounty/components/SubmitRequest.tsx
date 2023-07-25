import { Button } from "@/components";
import { submitRequestFFA } from "@/escrow/adapters";
import { BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { BountyState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP } from "@/types";

const SubmitRequest = ({ disabled }: { disabled?: boolean }) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
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
    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );
    const index = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
    );

    if (index !== -1) {
      currentBounty.currentUserRelationsList.splice(index, 1);
    }

    const index2 = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );

    if (index2 !== -1) {
      currentBounty.currentUserRelationsList.splice(index2, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.AWAITING_REVIEW,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "submit-request",
    });

    setCurrentBounty(updatedBounty);
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
  };

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      disabledText="Please open a PR closing the GitHub Issue before submitting"
    >
      Submit
    </Button>
  );
};

export default SubmitRequest;

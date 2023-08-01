import { Button } from "@/components";
import { BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useReferral } from "@/src/providers/referralProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP } from "@/types/";

const RequestToSubmit = () => {
  const { currentUser, currentWallet } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const { createReferralMember } = useReferral();

  const onClick = async () => {
    // Request to submit. Does not interact on chain
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }
    const result = await createReferralMember(
      new PublicKey(currentBounty.escrow.mint.publicKey)
    );

    // const referralKey = result?.memberPDA;
    // const signature = result?.txId;
    const { updatedBounty } = await mutateAsync({
      currentUserId: currentUser.id,
      bountyId: currentBounty.id,
      userId: currentUser.id,
      relations: currentBounty.isCreator
        ? [
            ...currentBounty.currentUserRelationsList,
            BOUNTY_USER_RELATIONSHIP.RequestedSubmitter,
          ]
        : [BOUNTY_USER_RELATIONSHIP.RequestedSubmitter],
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      label: "request-to-submit",
      signature: "n/a",
    });

    setCurrentBounty(updatedBounty);
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setTimeout(() => {
        setCurrentTutorialState({
          ...currentTutorialState,
          isRunning: true,
          currentStep: 2,
        });
      }, 100);
    }
  };

  return (
    <Button onClick={onClick} disabled={!currentWallet.publicKey}>
      Apply
    </Button>
  );
};

export default RequestToSubmit;

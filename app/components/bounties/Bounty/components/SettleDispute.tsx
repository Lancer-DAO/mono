import { settleDisputeFFA } from "@/escrow/adapters";
import { BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { updateList } from "@/src/utils";
import { BountyActionsButton } from ".";
import { useState } from "react";
import toast from "react-hot-toast";

export const SettleDispute = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const [isLoading, setIsLoading] = useState(false);

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
    const signature = await settleDisputeFFA(
      0.5,
      new PublicKey(currentBounty.creator.publicKey),
      new PublicKey("jy3YXFzKWxnLeqN1nD3cAeKpDhuEovU7ETRsFAsSbcv"),
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
      [BOUNTY_USER_RELATIONSHIP.Dispute]
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
      label: "dispute",
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
    <BountyActionsButton
      type="green"
      text={isLoading ? "Loading ..." : "Dispute"}
      onClick={onClick}
      isLoading={isLoading}
    />
  );
};

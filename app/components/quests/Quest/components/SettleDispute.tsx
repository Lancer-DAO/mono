import { settleDisputeFFA } from "@/escrow/adapters";
import { BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { decimalToNumber, updateList } from "@/src/utils";
import { QuestActionsButton } from ".";
import { useState } from "react";
import toast from "react-hot-toast";

export const SettleDispute = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const [disputePayoutValue, setDisputePayoutValue] = useState(
    decimalToNumber(currentBounty.escrow.amount)
  );

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
      disputePayoutValue,
      new PublicKey(currentBounty.creator.publicKey),
      new PublicKey(currentBounty.disputer.publicKey),
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
        BOUNTY_USER_RELATIONSHIP.DisputeHandler,
      ],
      [BOUNTY_USER_RELATIONSHIP.DisputeHandler]
    );

    const updatedBounty = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: newRelations,
      state: BountyState.DISPUTE_SETTLED,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "settle-dispute",
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
    const toastId = toast.success("Successfully submitted request");
    setTimeout(() => {
      toast.dismiss(toastId);
    }, 2000);
  };

  return (
    <>
      <input
        type="number"
        className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3 disabled:opacity-50 disabled:cursor-not-allowed"
        name="issuePrice"
        placeholder="Price"
        id="issue-price-input"
        value={disputePayoutValue}
        onChange={(e) => {
          setDisputePayoutValue(parseFloat(e.target.value));
        }}
      />
      <QuestActionsButton
        type="green"
        text={isLoading ? "Loading ..." : "Settle Dispute"}
        onClick={onClick}
        isLoading={isLoading}
        disabled={
          disputePayoutValue > decimalToNumber(currentBounty.escrow.amount)
        }
      />
    </>
  );
};

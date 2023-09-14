import { useState } from "react";
import { approveRequestFFA, approveRequestFFAOld } from "@/escrow/adapters";
import {
  BADGES_PROJECT_PARAMS,
  CREATE_COMPLETION_BADGES,
} from "@/src/constants";
import { BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useReferral } from "@/src/providers/referralProvider";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { decimalToNumber } from "@/src/utils";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { createUnderdogClient } from "@underdog-protocol/js";
import { BountyActionsButton } from ".";
import toast from "react-hot-toast";
import e from "express";

const underdogClient = createUnderdogClient({});

export const ApproveSubmission = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();

  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { programId: buddylinkProgramId } = useReferral();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const [isLoading, setIsLoading] = useState(false);

  if (
    !currentBounty ||
    !(currentBounty.isCreator && currentBounty.currentSubmitter)
  )
    return null;

  const onClick = async () => {
    setIsLoading(true);
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 5
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }

    const signature = await approveRequestFFA(
      new PublicKey(currentBounty?.currentSubmitter.publicKey),
      currentBounty?.escrow,
      currentWallet,
      buddylinkProgramId,
      program,
      provider
    );
    const submitterKey = currentBounty?.currentSubmitter.publicKey;
    const updatedBounty = await mutateAsync({
      bountyId: currentBounty?.id,
      currentUserId: currentUser.id,
      userId: currentBounty?.currentSubmitter.userid,
      relations: [BOUNTY_USER_RELATIONSHIP.Completer],
      state: BountyState.COMPLETE,
      publicKey: submitterKey,
      escrowId: currentBounty?.escrowid,
      signature,
      label: "complete-bounty",
    });

    setCurrentBounty(updatedBounty);

    if (CREATE_COMPLETION_BADGES && !currentBounty?.isTest) {
      const creatorKey = currentBounty?.creator.publicKey;

      const reputationIncrease =
        100 * decimalToNumber(currentBounty?.estimatedTime);

      await underdogClient.createNft({
        params: BADGES_PROJECT_PARAMS,
        body: {
          name: `Completer: ${currentBounty?.id}`,
          image:
            "https://utfs.io/f/969ce9f5-f272-444a-ac76-5b4a9e2be9d9_quest_completed.png",
          description: currentBounty?.description,
          attributes: {
            reputation: reputationIncrease,
            completed: dayjs().toISOString(),
            tags: currentBounty?.tags.map((tag) => tag.name).join(","),
            role: "completer",
          },
          upsert: false,
          receiverAddress: submitterKey,
        },
      });

      await underdogClient.createNft({
        params: BADGES_PROJECT_PARAMS,
        body: {
          name: `Creator: ${currentBounty?.id}`,
          image:
            "https://utfs.io/f/969ce9f5-f272-444a-ac76-5b4a9e2be9d9_quest_completed.png",
          description: currentBounty?.description,
          attributes: {
            reputation: reputationIncrease,
            completed: dayjs().toISOString(),
            tags: currentBounty?.tags.map((tag) => tag.name).join(","),
            role: "creator",
          },
          upsert: false,
          receiverAddress: creatorKey,
        },
      });
    }

    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 5
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: true,
        currentStep: 6,
      });
    }
    setIsLoading(false);
    toast.success("Successfully approved submission");
  };

  return (
    <BountyActionsButton
      type="green"
      text="Approve Submission"
      onClick={onClick}
      isLoading={isLoading}
    />
  );
};

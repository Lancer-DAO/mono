import { BountyState } from "@/types/";
import {
  BONK_MINT,
  BOUNTY_PROJECT_PARAMS,
  IS_CUSTODIAL,
  IS_MAINNET,
  PROFILE_PROJECT_PARAMS,
  USDC_MINT,
} from "@/constants";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  CancelEscrow,
  RequestToSubmit,
  ApproveSubmission,
  DenySubmission,
  VoteToCancel,
  RequestChanges,
  SubmitRequest,
  BountyActionsButton,
} from ".";
import { useUserWallet } from "@/src/providers";

export const BountyActions = () => {
  const { currentBounty } = useBounty();
  const { currentWallet } = useUserWallet();

  if (!currentWallet || !currentWallet.publicKey) {
    return IS_CUSTODIAL ? (
      <></>
    ) : (
      <BountyActionsButton
        type="neutral"
        text="Please Connect Wallet"
        disabled
      />
    );
  }
  if (currentBounty.state === BountyState.COMPLETE) {
    return (
      <BountyActionsButton type="green" text="Bounty Completed" disabled />
    );
  }
  if (currentBounty.state === BountyState.CANCELED) {
    return <BountyActionsButton type="red" text="Bounty Canceled" disabled />;
  }
  if (!currentBounty.currentUserRelationsList) {
    return <RequestToSubmit />;
  }
  if (currentBounty.isRequestedSubmitter)
    return (
      <BountyActionsButton
        type="neutral"
        text="Application Submitted"
        disabled
      />
    );
  if (currentBounty.isDeniedRequester)
    return (
      <BountyActionsButton
        type="red"
        text="Submission Request Denied"
        disabled
      />
    );

  return (
    <div className="flex flex-wrap gap-3 pt-4" id="bounty-actions">
      <>
        <SubmitRequest />
        <ApproveSubmission />
        <RequestChanges />
        <DenySubmission />
        <VoteToCancel />
        <CancelEscrow />
      </>
    </div>
  );
};

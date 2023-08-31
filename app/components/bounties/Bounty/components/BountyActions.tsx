import { BountyState } from "@/types/";
import { IS_CUSTODIAL } from "@/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  CancelEscrow,
  Apply,
  ApproveSubmission,
  DenySubmission,
  VoteToCancel,
  RequestChanges,
  SubmitRequest,
  BountyActionsButton,
} from ".";
import { useMemo } from "react";

export const BountyActions = () => {
  const { currentBounty } = useBounty();
  const { currentTutorialState } = useTutorial();
  const { publicKey } = useWallet();

  const buttons = useMemo(() => {
    if (!currentBounty) return [null];
    if (!publicKey) {
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
      return <Apply />;
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
      <>
        <SubmitRequest />
        <ApproveSubmission />
        <RequestChanges />
        <DenySubmission />
        <VoteToCancel />
        <CancelEscrow />
      </>
    );
  }, [!!currentBounty]);

  return (
    <div className="flex flex-wrap gap-3 pt-4" id="bounty-actions">
      {buttons}
    </div>
  );
};

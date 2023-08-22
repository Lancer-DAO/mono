import { Button } from "@/components";
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
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import {
  CancelEscrow,
  RequestToSubmit,
  ApproveSubmission,
  DenySubmission,
  VoteToCancel,
  RequestChanges,
  SubmitRequest,
} from ".";

export const BountyActions = () => {
  const { currentBounty } = useBounty();
  const { currentTutorialState } = useTutorial();
  const { currentWallet } = useUserWallet();

  if (!currentWallet) {
    return IS_CUSTODIAL ? (
      <></>
    ) : (
      <div className="bounty-buttons" id="bounty-actions">
        <Button disabled id="bounty-completed">
          Please Connect a Wallet
        </Button>
      </div>
    );
  }
  if (currentBounty.state === BountyState.COMPLETE) {
    return (
      <div className="bounty-buttons" id="bounty-actions">
        <Button disabled id="bounty-completed">
          Bounty Completed
        </Button>
      </div>
    );
  }
  if (currentBounty.state === BountyState.CANCELED) {
    return (
      <div className="bounty-buttons" id="bounty-actions">
        <Button disabled id="bounty-canceled">
          Bounty Canceled
        </Button>
      </div>
    );
  }
  if (!currentBounty.currentUserRelationsList) {
    return (
      <div className="bounty-buttons" id="bounty-actions">
        <RequestToSubmit />
      </div>
    );
  }
  if (currentBounty.isRequestedSubmitter)
    return (
      <Button disabled id="request-pending">
        Request Pending
      </Button>
    );
  if (currentBounty.isDeniedRequester)
    return (
      <Button disabled id="request-denied">
        Submission Request Denied
      </Button>
    );

  return (
    <div className="bounty-buttons pt-4" id="bounty-actions">
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

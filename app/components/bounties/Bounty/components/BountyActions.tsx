import { Button } from "@/components";
import { BountyState } from "@/types";
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
// TODO: properly alias these imports
import CancelEscrow from "./CancelEscrow";
import RequestToSubmit from "./RequestToSubmit";
import ApproveSubmission from "./ApproveSubmission";
import DenySubmission from "./DenySubmission";
import VoteToCancel from "./VoteToCancel";
import RequestChanges from "./RequestChanges";
import SubmitRequest from "./SubmitRequest";

const BountyActions = () => {
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

  return (
    <div className="bounty-buttons pt-4" id="bounty-actions">
      <>
        {currentBounty.isCreator &&
          ((!!currentTutorialState &&
            currentTutorialState?.title ===
              BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title) ||
            !IS_MAINNET) &&
          currentBounty.currentUserRelationsList.length < 2 && (
            <RequestToSubmit />
          )}
        {currentBounty.isRequestedSubmitter && (
          <Button disabled id="request-pending">
            Request Pending
          </Button>
        )}
        {currentBounty.isDeniedRequester && (
          <Button disabled id="request-denied">
            Submission Request Denied
          </Button>
        )}
        {currentBounty.isApprovedSubmitter &&
          !currentBounty.currentSubmitter && (
            // <div
            //   className="hover-tooltip-wrapper"
            //   onMouseEnter={() => {
            //     setHoveredButton("submit");
            //   }}
            //   onMouseLeave={() => {
            //     setHoveredButton("none");
            //   }}
            // >
            <SubmitRequest disabled={!currentWallet.publicKey} />
            // </div>
          )}
        {currentBounty.isCurrentSubmitter && !currentBounty.isCreator && (
          <Button disabled id="submission-pending">
            Submission Pending Review
          </Button>
        )}
        {currentBounty.isDeniedSubmitter && (
          <Button disabled id="submission-denied">
            Submission Denied
          </Button>
        )}
        {currentBounty.isChangesRequestedSubmitter && <SubmitRequest />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <ApproveSubmission />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <RequestChanges />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <DenySubmission />}
        {(currentBounty.isCreator ||
          currentBounty.isCurrentSubmitter ||
          currentBounty.isDeniedSubmitter ||
          currentBounty.isChangesRequestedSubmitter) &&
          !currentBounty.isVotingCancel && <VoteToCancel />}
        {currentBounty.isCreator && currentBounty.needsToVote.length === 0 && (
          <CancelEscrow />
        )}
        {currentBounty.completer && <Button disabled>Complete</Button>}
      </>
    </div>
  );
};

export default BountyActions;

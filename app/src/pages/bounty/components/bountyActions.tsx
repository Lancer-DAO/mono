import {
  MERGE_PULL_REQUEST_API_ROUTE,
  UPDATE_ISSUE_ROUTE,
  USER_ISSUE_RELATION_ROUTE,
} from "@/constants";
import { LoadingBar } from "@/src/components/LoadingBar";
import {
  addSubmitterFFA,
  approveRequestFFA,
  cancelFFA,
  denyRequestFFA,
  submitRequestFFA,
  voteToCancelFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import {
  Contributor,
  BountyState,
  BOUNTY_USER_RELATIONSHIP,
} from "@/src/types";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import classNames from "classnames";
import { useState } from "react";
import {
  ApproveSubmission,
  CancelEscrow,
  DenySubmission,
  RequestChanges,
  RequestToSubmit,
  SubmitRequest,
  VoteToCancel,
} from "./buttons";

export const BountyActions = () => {
  const { currentUser, currentBounty } = useLancer();

  const [hoveredButton, setHoveredButton] = useState("none");
  if (false) {
    return <LoadingBar title="Loading On Chain Details" />;
  }
  console.log(currentBounty, currentUser);
  // if (currentBounty.state === BountyState.COMPLETE) {
  //   return (
  //     <button className={classNames("button-primary disabled")}>
  //       Bounty Completed
  //     </button>
  //   );
  // }
  if (currentBounty.state === BountyState.CANCELED) {
    return (
      <button className={classNames("button-primary disabled")}>
        Bounty Canceled
      </button>
    );
  }
  if (!currentBounty.currentUserRelationsList) {
    return <RequestToSubmit />;
  }

  return (
    <div className="bounty-buttons">
      <>
        {currentBounty.isCreator &&
          (currentBounty.isVotingCancel
            ? currentBounty.currentUserRelationsList.length === 2
            : currentBounty.currentUserRelationsList.length === 1) && (
            <RequestToSubmit />
          )}
        {currentBounty.isRequestedSubmitter && (
          <button className={classNames("button-primary disabled")}>
            Request Pending
          </button>
        )}
        {currentBounty.isDeniedRequester && (
          <button className={classNames("button-primary disabled")}>
            Submission Request Denied
          </button>
        )}
        {currentBounty.isApprovedSubmitter &&
          !currentBounty.currentSubmitter && (
            <div
              className="hover-tooltip-wrapper"
              onMouseEnter={() => {
                setHoveredButton("submit");
              }}
              onMouseLeave={() => {
                setHoveredButton("none");
              }}
            >
              <SubmitRequest
                disabled={currentBounty.pullRequests.length === 0}
              />
              {hoveredButton === "submit" &&
                currentBounty.pullRequests.length === 0 && (
                  <div className="hover-tooltip">
                    Please open a PR closing this currentBounty before
                    submitting
                  </div>
                )}
            </div>
          )}
        {currentBounty.isCurrentSubmitter && !currentBounty.isCreator && (
          <button className={classNames("button-primary disabled")}>
            Submission Pending Review
          </button>
        )}
        {currentBounty.isDeniedSubmitter && (
          <button className={classNames("button-primary disabled")}>
            Submission Denied
          </button>
        )}
        {currentBounty.isChangesRequestedSubmitter && <SubmitRequest />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <ApproveSubmission />}
        <ApproveSubmission />
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
        {currentBounty.completer && (
          <button className={classNames("button-primary disabled")}>
            Complete
          </button>
        )}
      </>
    </div>
  );
};

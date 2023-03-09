import { useCallback, useState, useEffect } from "react";
import classnames from "classnames";
import { ContributorCompensationInfo, Issue, IssueState } from "@/types";
// import SolLogo from "@/node_modules/cryptocurrency-icons/svg/black/sol.svg";

import axios from "axios";
import {
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { convertToQueryParams, deepCopy, getApiEndpoint, getApiEndpointExtenstion, getSolscanAddress } from "@/utils";
import { last } from "lodash";
const AUTHOR_SELECTOR = ".author.text-bold.Link--secondary";
interface PullRequestProps {
  issue: Issue;
}
enum DistributionState {
  DRAFT = "Mark for Review",
  PAID = "Approved",
  REVIEW = "Awaiting Review",
  ERROR = "Error",
}

export const PullRequest = ({ issue }: PullRequestProps) => {
  const [buttonText, setButtonText] = useState(
    issue.state === IssueState.IN_PROGRESS
      ? DistributionState.DRAFT 
      : issue.state === IssueState.AWAITING_REVIEW ? DistributionState.REVIEW : DistributionState.PAID
  );
  console.log(issue);
  const onClick = useCallback(async () => {
    setButtonText(DistributionState.REVIEW);
    axios.put(
      `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}?${convertToQueryParams(
        {
          ...issue,
          state: IssueState.AWAITING_REVIEW,
        }
      )}`
    );
  }, [issue]);
  console.log(issue);
  return (
    <>
      <div className="funded-issue-upper">
        <div className="lancer-funded-title">
          The Linked Issue Was Funded Through Lancer
        </div>
        {!issue.paid && (
          <>
            <div className="lancer-funded-amount">
              {`Issue Payout: ${issue.amount?.toFixed(4)} SOL`}
              {/* <SolLogo className="sol-logo-small" /> */}

              <button
                className={classnames(
                  "confirm-button",
                  "hug",
                  "margin-left-auto"
                )}
                onClick={(e) => {
                  window.open(
                    getSolscanAddress(issue.hash),
                    "_blank"
                  );
                  e.preventDefault();
                }}
              >
                View
              </button>
            </div>
          </>
        )}
      </div>

      <>
        <div className="lancer-funded-amount">
          {issue.state === IssueState.APPROVED ? "Funds Sent to Contributors" : "Funds Ready to Send"}

          {issue.state !== IssueState.APPROVED && (
            <button
              className={classnames(
                "confirm-button",
                "hug",
                "margin-left-auto",
                {
                  disabled:
                    issue.state !== IssueState.NEW &&
                    issue.state !== IssueState.IN_PROGRESS,
                }
              )}
              disabled={
                issue.state !== IssueState.NEW &&
                issue.state !== IssueState.IN_PROGRESS
              }
              onClick={(e) => {
                onClick();
                e.preventDefault();
              }}
            >
              {buttonText}
            </button>
          )}
        </div>
        {issue.pullNumber && (
          <div className="fund-split-outer">
            <div className="fund-split-wrapper-cs" key={issue.pubkey}>
              <img
                className="contributor-picture-sm"
                src={`https://avatars.githubusercontent.com/u/${
                  issue.githubId.split("|")[1]
                }?s=60&v=4`}
              />
              <div className="contributor-name">{`${
                issue.author
              }: ${issue.amount?.toFixed(4)} SOL`}</div>
              {issue.payoutHash && (
                <button
                  className={classnames(
                    "confirm-button",
                    "hug",
                    "margin-left-auto"
                  )}
                  onClick={(e) => {
                    window.open(
                      getSolscanAddress(issue.payoutHash),
                      "_blank"
                    );
                    e.preventDefault();
                  }}
                >
                  View
                </button>
              )}
            </div>
          </div>
        )}
      </>
    </>
  );
};

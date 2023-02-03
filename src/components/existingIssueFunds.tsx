import { useCallback, useState, useEffect } from "react";
import classnames from "classnames";
import { Issue, IssueState } from "@/types";
import { getSolscanAddress } from "@/utils";

interface ExistingIssueFundsProps {
  issue: Issue;
}
enum DistributionState {
  FUND = "Approve",
  FUNDING = "Approving",
  FUNDED = "Approved",
  ERROR = "Error",
}

export const ExistingIssueFunds = ({ issue }: ExistingIssueFundsProps) => {
  const [buttonText, setButtonText] = useState(DistributionState.FUND);

  const onClick = useCallback(async () => {
    setButtonText(DistributionState.FUNDING);

    chrome.runtime.sendMessage(
      {
        message: "distribute_pull_request_split",
        issue: issue,
        windowWidth: window.innerWidth
    },
      (response) => {
        if (response.message === "confirmed") {
          setButtonText(DistributionState.FUNDED);
        }
      }
    );
  }, [issue]);
  return (
    <>
      <div className="funded-issue-upper">
        <div className="lancer-funded-title">
          This Issue Was Funded Through Lancer
        </div>
        {!issue.paid && (
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
        )}
      </div>

      {issue.pullNumber && (
        <>
          <div className="lancer-funded-amount">
            {issue.state === IssueState.APPROVED
              ? "Funds Sent to Contributors"
              : "Awaiting Approval"}
          </div>
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
              {issue.payoutHash ? (
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
              ) : (
                <button
                  className={classnames(
                    "confirm-button",
                    "hug",
                    "margin-left-auto"
                  )}
                  onClick={(e) => {
                    onClick();
                    e.preventDefault();
                  }}
                >
                  {buttonText}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

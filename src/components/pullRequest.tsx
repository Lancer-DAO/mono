import { useCallback, useState, useEffect } from "react";
import classnames from "classnames";
import { ContributorCompensationInfo, Issue, IssueState } from "@/types";
// import SolLogo from "@/node_modules/cryptocurrency-icons/svg/black/sol.svg";

interface PullRequestProps {
  issueProp: Issue;
}
enum DistributionState {
  FUND = "Mark for Review",
  FUNDING = "Marked for Review",
  FUNDED = "Edit Distribution",
  ERROR = "Error",
}

const currentContributors: ContributorCompensationInfo[] = [
  {
    pubkey: "BuxU7uwwkoobF8p4Py7nRoTgxWRJfni8fc4U3YKGEXKs",
    name: "jacksturt",
    picture: "https://avatars.githubusercontent.com/u/117492794?s=60&v=4",
    amount: 1,
  },
];

export const PullRequest = ({ issueProp }: PullRequestProps) => {
  const [issue, setIssue] = useState(issueProp);
  const [buttonText, setButtonText] = useState(DistributionState.FUND);
  console.log(issue);
  useEffect(() => {
    if (!issue.fundingSplit) {
      const newSplit = [{ ...currentContributors[0], amount: issue.amount }];
      const newIssue = {
        ...issue,
        fundingSplit: newSplit,
        state: IssueState.AWAITING_REVIEW,
      };
      console.log(issue, newIssue, newSplit);
      setIssue(newIssue);
      chrome.runtime.sendMessage({
        message: "update_issue_info",
        issue: newIssue,
      });
    }
  }, []);
  const onClick = useCallback(async () => {
    setButtonText(DistributionState.FUNDING);

    // chrome.runtime.sendMessage(
    //   {
    //     message: "set_pull_request_split",
    //     issue: issue,
    //   },
    //   (response) => {
    //     if (response.message === "issue_updated") {
    //       setButtonText(DistributionState.FUNDED);
    //       setIssue(response.issue);
    //     }
    //   }
    // );
  }, [issue]);
  return (
    <>
      <div className="funded-issue-upper">
        <div className="lancer-funded-title">
          The Linked Issue Was Funded Through Lancer
        </div>
        {!issue.paid && (
          <>
            <div className="lancer-funded-amount">
              {`Issue Payout: ${issue.amount}`}
              {/* <SolLogo className="sol-logo-small" /> */}

              <button
                className={classnames(
                  "confirm-button",
                  "hug",
                  "margin-left-auto"
                )}
                onClick={(e) => {
                  window.open(
                    `https://solscan.io/tx/${issue.hash}?cluster=devnet`,
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
          {issue.paid ? "Funds Sent to Contributors" : "Funds Ready to Send"}

          {!issue.paid && (
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
        {issue.fundingSplit && (
          <div className="fund-split-outer">
            {issue.fundingSplit.map((split) => (
              <div className="fund-split-wrapper-cs" key={split.pubkey}>
                <img className="contributor-picture-sm" src={split.picture} />
                <div className="contributor-name">{split.name}</div>
                <div className="contributor-amount">
                  {`${split.amount.toFixed(4)}`}
                  {/* <SolLogo className="sol-logo-small" /> */}
                </div>
                {split.signature && (
                  <button
                    className={classnames(
                      "confirm-button",
                      "hug",
                      "margin-left-4"
                    )}
                    onClick={(e) => {
                      window.open(
                        `https://solscan.io/tx/${split.signature}?cluster=devnet`,
                        "_blank"
                      );
                      e.preventDefault();
                    }}
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    </>
  );
};

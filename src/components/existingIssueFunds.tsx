import { useCallback, useState, useEffect } from "react";
import classnames from "classnames";
import { Issue } from "@/types";

interface ExistingIssueFundsProps {
  issue: Issue;
}
enum DistributionState {
  FUND = "Send Funds",
  FUNDING = "Sending Funds",
  FUNDED = "Sent Funds",
  ERROR = "Error",
}

export const ExistingIssueFunds = ({ issue }: ExistingIssueFundsProps) => {
  const [buttonText, setButtonText] = useState(DistributionState.FUND);

  const onClick = useCallback(async () => {
    setButtonText(DistributionState.FUNDING);
    const splitURL = window.document.URL.split("/");
    const repoName = `${splitURL[3]}.${splitURL[4]}`;

    chrome.runtime.sendMessage(
      {
        message: "distribute_pull_request_split",
        issue: issue,
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
          <>
            <div className="lancer-funded-amount">
              {`Issue Payout: ${issue.amount}`}
            </div>
            <button
              className={"confirm-button"}
              onClick={(e) => {
                window.open(
                  `https://solscan.io/tx/${issue.hash}?cluster=devnet`,
                  "_blank"
                );
                e.preventDefault();
              }}
            >
              View Funding
            </button>
          </>
        )}
      </div>

      {issue.fundingSplit && (
        <>
          <div className="lancer-funded-amount">
            {issue.paid ? "Funds Sent to Contributors" : "Funding Split Set"}
          </div>
          <div className="fund-split-outer">
            {issue.fundingSplit.map((split) => (
              <div className="fund-split-wrapper-cs" key={split.pubkey}>
                <img className="contributor-picture-sm" src={split.picture} />
                <div className="contributor-name">{split.name}</div>
                <div className="contributor-amount">
                  {`${split.amount.toFixed(4)}`}{" "}
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
          {!issue.paid && (
            <button
              className={"confirm-button"}
              onClick={(e) => {
                onClick();
                e.preventDefault();
              }}
            >
              {buttonText}
            </button>
          )}
        </>
      )}
    </>
  );
};

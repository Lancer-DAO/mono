import { useCallback, useState, useEffect } from "react";
import classnames from "classnames";
import { Issue, IssueState } from "@/types";

enum FundingState {
  FUND = "Fund",
  FUNDING = "Funding",
  FUNDED = "Funded",
  ERROR = "Error",
}

export const FundIssue = () => {
  const [solAmount, setSolAmount] = useState<number>();
  const [buttonText, setButtonText] = useState(FundingState.FUND);
  const [sendHash, setSendHash] = useState<string>();
  const [issueTitle, setIssueTitle] = useState<string>();

  useEffect(
    () => {
      // @ts-ignore
      const issueTitle = window.document.getElementById("issue_title")?.value;
      if (issueTitle) {
        setIssueTitle(issueTitle);
      }
    },
    // @ts-ignore
    [window.document.getElementById("issue_title")?.value]
  );

  const onClick = useCallback(async () => {
    if (!solAmount || !issueTitle) {
      return;
    }
    setButtonText(FundingState.FUNDING);
    const splitURL = window.document.URL.split("/");
    const newIssue: Issue = {
      amount: solAmount,
      org: splitURL[3],
      repo: splitURL[4],
      title: issueTitle,
      state: IssueState.NEW,
    };

    chrome.runtime.sendMessage(
      {
        message: "fund_issue",
        issue: newIssue,
      },
      (response) => {
        if (response.message === "confirmed") {
          setButtonText(FundingState.FUNDED);
          setSendHash(response.hash);
        }
      }
    );
  }, [solAmount, buttonText, issueTitle]);

  return (
    <>
      <div className="fund-issue-upper">
        <input
          value={solAmount}
          onChange={(e) => {
            setSolAmount(parseFloat(e.target.value));
          }}
          // @ts-ignore
          required="required"
          placeholder="Payout in $SOL"
          type="number"
          className={classnames([
            "payout-input",
            "form-control",
            "input-contrast",
          ])}
        />
        <button
          disabled={!solAmount && !issueTitle}
          className={classnames(["payout-button", "btn-primary", "btn"], {
            disabled: !solAmount,
          })}
          onClick={(e) => {
            if (solAmount) {
              onClick();
            }
            e.preventDefault();
          }}
        >
          {buttonText}
        </button>
      </div>
      {sendHash && (
        <div className="transaction-hash">{`Transaction Hash: ${sendHash}`}</div>
      )}
    </>
  );
};

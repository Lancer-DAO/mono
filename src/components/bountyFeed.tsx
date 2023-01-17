import { useCallback, useState, useEffect } from "react";
import classnames from "classnames";
// import Logo from "@/assets/logo.svg";
import { Issue, IssueState, IssueType } from "@/types";
import { capitalize } from "lodash";
// import SolLogo from "@/node_modules/cryptocurrency-icons/svg/black/sol.svg";
// import { ProgressBar } from "@/atoms";

enum FundingState {
  FUND = "Fund",
  FUNDING = "Funding",
  FUNDED = "Funded",
  ERROR = "Error",
}

interface BountyFeedProps {
  issues: Issue[];
}

const getIssueTypeLabel = (type: IssueType): string => {
  switch (type) {
    case IssueType.BUG:
      return "FIX";
    case IssueType.TEST:
      return "TEST";
    case IssueType.FEATURE:
      return "CREATE";
    case IssueType.DOCUMENTATION:
      return "DOCUMENT";
  }
};

const getIssueStateProgress = (state: IssueState): number => {
  switch (state) {
    case IssueState.NEW:
      return 0;
    case IssueState.IN_PROGRESS:
      return 25;
    case IssueState.AWAITING_REVIEW:
      return 50;
    case IssueState.APPROVED:
      return 75;
    case IssueState.COMPLETE:
    case IssueState.CANCELED:
      return 100;
  }
};

const getIssueLogo = (i: number): string => {
  if (i % 4 === 0) {
    return "https://avatars.githubusercontent.com/u/91104561?v=4";
  }
  if (i % 4 === 1) {
    return "https://avatars.githubusercontent.com/u/117492794?s=16&v=4";
  }
  if (i % 4 === 2) {
    return "https://avatars.githubusercontent.com/u/119355107?s=16&v=4";
  }
  return "https://avatars.githubusercontent.com/u/119980205?s=16&v=4";
};

export const BountyFeed = ({ issues }: BountyFeedProps) => {
  return (
    <div className="bounty-tab">
      <div className="bounty-tab-header">
        {/* <Logo className="bounty-header-logo" /> */}

        <div className="bounty-header-title">Lancer Bounty Feed</div>
      </div>
      <div className="bounty-tab-body">
        {issues.map((issue, i) => {
          return (
            <a
              className="bounty"
              href={`https://github.com/${issue.repo.replace(
                ".",
                "/"
              )}/issues/${issue.issueNumber}`}
              about="_blank"
              key={issue.title}
            >
              {/* {issue.type && <h1>{getIssueTypeLabel(issue.type)}</h1>} */}
              <h1 className="issue-title">{issue.title}</h1>
              <img className="bounty-photo" src={getIssueLogo(i)} />
              <h1 className="contributor-amount">
                {/* REWARD */}
                {`${issue.amount} `}
                {/* <SolLogo className="solana-logo" /> */}
              </h1>
              <div className="issue-state-wrapper">
                <div className={classnames("issue-state")}>
                  {issue.state
                    .split("_")
                    .map((s) => capitalize(s))
                    .join(" ")}
                </div>
                {/* <ProgressBar value={getIssueStateProgress(issue.state)} /> */}
              </div>

              <a
                className="funded-by"
                href={`https://github.com/${issue.repo.split(".")[0]}}`}
                about="_blank"
              >
                {`Sponsored by: ${issue.repo.split(".")[0]}`}
              </a>
            </a>
          );
        })}
      </div>
    </div>
  );
};

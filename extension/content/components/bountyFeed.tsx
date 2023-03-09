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

export const BountyFeed = ({ issues }: BountyFeedProps) => {
  return (
    <div className="bounty-tab">
      <div className="bounty-tab-header">
        {/* <Logo className="bounty-header-logo" /> */}

        <div className="bounty-header-title">Lancer Bounty Feed</div>
      </div>
      <div className="bounty-tab-body">
        {issues.map((issue) => {
          return (
            <a
              className="bounty"
              href={`https://github.com/${issue.org}/${issue.repo}/issues/${issue.issueNumber}`}
              about="_blank"
              key={issue.title}
            >
              {/* {issue.type && <h1>{getIssueTypeLabel(issue.type)}</h1>} */}
              <h1 className="issue-title">{issue.title}</h1>
              <img
                className="contributor-picture"
                src={`https://avatars.githubusercontent.com/u/${
                  issue.githubId?.split("|")[1]
                }?s=60&v=4`}
              />
              <h1 className="contributor-amount">
                {/* REWARD */}
                {`${issue.amount.toFixed(4)} SOL`}
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
                href={`https://github.com/${issue.org}}`}
                about="_blank"
              >
                {`Sponsored by: ${issue.org}`}
              </a>
            </a>
          );
        })}
      </div>
    </div>
  );
};

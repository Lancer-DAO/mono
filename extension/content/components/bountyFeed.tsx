import { Issue } from "../types";
import { capitalize } from "lodash";
import { getMintName } from "../utils";

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
              <div className="issue-header">
                <img
                  className="contributor-picture"
                  src={`https://avatars.githubusercontent.com/u/${117492794}?s=60&v=4`}
                />
                <div className="issue-header-right">
                  <div className="issue-amount">
                    ${issue.amount} ({getMintName(issue.mint)})
                  </div>

                  <a
                    className="issue-creator"
                    href={`https://github.com/${issue.org}/${issue.repo}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {issue.org}/{issue.repo}
                  </a>
                </div>
              </div>
              <div className="issue-body">
                <div className="issue-title">{issue.title}</div>
                <div className="issue-description">{issue.description}</div>
              </div>

              <div className="issue-footer">
                <div className="issue-tags">
                  {issue.tags &&
                    issue.tags.map((tag, index) => (
                      <div className="tag" key={index}>
                        {capitalize(tag)}
                      </div>
                    ))}
                </div>
                <div className="issue-footer-right">
                  <div className={`issue-state ${issue.state}`}>
                    {issue.state}
                  </div>
                  {!Number.isNaN(issue.estimatedTime) && (
                    <div className="issue-estimated-time">
                      {issue.estimatedTime} hours
                    </div>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

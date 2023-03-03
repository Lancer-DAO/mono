import { Issue } from "@/src/types";
import { getMintName } from "@/src/utils";
import { capitalize } from "lodash";
import { useRouter } from "next/router";
import Link from "next/link";

interface BountyCardProps {
  issue: Issue;
}

export const BountyCard = ({ issue }: BountyCardProps) => {
  const router = useRouter();
  return (
    <Link
      href={`/bounty?id=${issue.uuid}`}
      rel="noreferrer"
      className="issue-card"
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
          <div className={`issue-state ${issue.state}`}>{issue.state}</div>
          {!Number.isNaN(issue.estimatedTime) && (
            <div className="issue-estimated-time">
              {issue.estimatedTime} hours
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

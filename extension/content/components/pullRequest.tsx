import { Issue } from "../types";

export const PullRequest = ({
  issue,
  endpoint,
}: {
  issue: Issue;
  endpoint: string;
}) => {
  return (
    <>
      <div className="text-bold discussion-sidebar-heading discussion-sidebar-toggle hx_rsm-trigger">
        This PR is linked to a Lancer Bounty
      </div>
      <a
        href={`${endpoint}/quests/${issue.uuid}`}
        target="_blank"
        rel="noreferrer"
      >
        View more details on Lancer
      </a>
    </>
  );
};

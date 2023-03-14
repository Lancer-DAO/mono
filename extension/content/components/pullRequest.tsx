import { Issue } from "../types";
import { getAppEndpointExtension } from "../utils";

export const PullRequest = ({ issue }: { issue: Issue }) => {
  return (
    <>
      <div className="funded-issue-upper">
        <div className="lancer-funded-title">
          This PR is linked to a Lancer Bounty
        </div>
      </div>
      <a
        href={`${getAppEndpointExtension()}/bounty?id=${issue.uuid}`}
        target="_blank"
        rel="noreferrer"
      >
        View more details on Lancer
      </a>
    </>
  );
};

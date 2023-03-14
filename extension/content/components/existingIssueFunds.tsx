import { Issue } from "../types";
import { getAppEndpointExtension, getMintName } from "../utils";

export const ExistingIssueFunds = ({ issue }: { issue: Issue }) => {
  return (
    <>
      <div className="funded-issue-upper">
        <div className="lancer-funded-title">
          This Issue Was Funded Through Lancer
        </div>
        <div>
          Bounty: ${`${issue.amount.toFixed(2)} ${getMintName(issue.mint)}`}
        </div>
        {issue.pullNumber && (
          <div>There is a submission pending for this bounty</div>
        )}
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

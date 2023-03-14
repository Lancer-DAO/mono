import { getAppEndpointExtension } from "../utils";

export const FundIssue = () => {
  return (
    <>
      <div className="fund-issue-upper">
        <a
          href={`${getAppEndpointExtension()}/fund`}
          target="_blank"
          rel="noreferrer"
        >
          Create New Issue With Lancer
        </a>
      </div>
    </>
  );
};

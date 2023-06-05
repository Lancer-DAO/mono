import { getApiEndpointExtension } from "../utils";

export const FundIssue = () => {
  return (
    <>
      <a
        href={`${getApiEndpointExtension()}/fund`}
        target="_blank"
        rel="noreferrer"
        className="btn-primary btn ml-2"
      >
        Create New Issue With Lancer
      </a>
    </>
  );
};

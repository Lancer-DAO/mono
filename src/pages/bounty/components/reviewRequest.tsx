import {
  ACCOUNT_ISSUE_API_ROUTE,
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
  MERGE_PULL_REQUEST_API_ROUTE,
} from "@/server/src/constants";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState } from "@/src/types";
import { approveRequestFFA, denyRequestFFA } from "@/src/onChain";

const ReviewRequest: React.FC = () => {
  const { issue, wallet, anchor, program, setIssue } = useLancer();
  if (
    !issue.escrowContract ||
    !issue.currentSubmitter ||
    issue.escrowContract.currentSubmitter.toString() ===
      "11111111111111111111111111111111"
  ) {
    return <div>Processing Submission</div>;
  }

  const approveSubmission = async () => {
    try {
      await approveRequestFFA(
        issue.creator.publicKey,
        issue.currentSubmitter.publicKey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
      axios.post(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${MERGE_PULL_REQUEST_API_ROUTE}`,
        {
          uuid: issue.uuid,
        }
      );
      setIssue({
        ...issue,
        state: IssueState.COMPLETE,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const denySubmission = async () => {
    try {
      await denyRequestFFA(
        issue.creator.publicKey,
        issue.currentSubmitter.publicKey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_ISSUE_API_ROUTE}`,
        {
          issueId: issue.uuid,
          accountId: issue.currentSubmitter.uuid,
          isSubmitter: false,
          isApprovedSubmitter: true,
        }
      );
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/state`,
        {
          uuid: issue.uuid,
          state: IssueState.IN_PROGRESS,
        }
      );
      setIssue({
        ...issue,
        state: IssueState.IN_PROGRESS,
      });
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div>
      {issue.currentSubmitter && (
        <div>{issue.currentSubmitter.githubLogin}</div>
      )}
      <button onClick={() => approveSubmission()}>{"Approve"}</button>
      <button onClick={() => denySubmission()}>{"Deny"}</button>
    </div>
  );
};

export default ReviewRequest;

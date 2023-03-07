import {
  ACCOUNT_ISSUE_API_ROUTE,
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState } from "@/src/types";
import { approveRequestFFA, denyRequestFFA } from "@/src/onChain";

const ReviewRequest: React.FC = () => {
  const { issue, wallet, anchor, program } = useLancer();

  const approveSubmission = async () => {
    try {
      await approveRequestFFA(
        issue.creator.pubkey,
        issue.submitter.pubkey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/state`,
        {
          uuid: issue.uuid,
          state: IssueState.COMPLETE,
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const denySubmission = async () => {
    try {
      await denyRequestFFA(
        issue.creator.pubkey,
        issue.submitter.pubkey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_ISSUE_API_ROUTE}`,
        {
          issueId: issue.uuid,
          accountId: issue.submitter.uuid,
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
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div>
      <div>{issue.submitter.githubLogin}</div>
      <button onClick={() => approveSubmission()}>{"Approve"}</button>
      <button onClick={() => denySubmission()}>{"Deny"}</button>
    </div>
  );
};

export default ReviewRequest;

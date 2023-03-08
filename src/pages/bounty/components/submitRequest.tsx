import {
  ACCOUNT_ISSUE_API_ROUTE,
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState, Submitter } from "@/src/types";
import {
  addSubmitterFFA,
  removeSubmitterFFA,
  submitRequestFFA,
} from "@/src/onChain";

export type SubmitterSectionType = "approved" | "requested";

const SubmitRequest: React.FC = () => {
  const {
    issue,
    wallet,
    anchor,
    program,
    user,
    setIssue,
    setIssueLoadingState,
  } = useLancer();
  // debugger;
  if (
    issue.escrowContract?.currentSubmitter.toString() !==
    "11111111111111111111111111111111"
  ) {
    return <div>Processing Denial</div>;
  }

  const submitRequest = async () => {
    try {
      await submitRequestFFA(
        issue.creator.pubkey,
        user.publicKey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_ISSUE_API_ROUTE}`,
        {
          issueId: issue.uuid,
          accountId: user.uuid,
          isSubmitter: true,
          isApprovedSubmitter: true,
        }
      );
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/state`,
        {
          uuid: issue.uuid,
          state: IssueState.AWAITING_REVIEW,
        }
      );
      setIssue({
        ...issue,
        state: IssueState.AWAITING_REVIEW,
      });
      setIssueLoadingState("getting_contract");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <button onClick={() => submitRequest()}>
        {"Mark Submission for Review"}
      </button>
    </div>
  );
};

export default SubmitRequest;

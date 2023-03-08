import {
  ACCOUNT_ISSUE_API_ROUTE,
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useLancer } from "@/src/providers/lancerProvider";
import { addSubmitterFFA } from "@/src/onChain";
import { IssueState } from "@/src/types";

const RequestToSubmit: React.FC = () => {
  const { user, issue, wallet, program, anchor, setIssue } = useLancer();
  if (!issue.escrowContract) {
    return <></>;
  }

  const requestToSubmit = async () => {
    if (issue.creator.uuid === user.uuid) {
      await addSubmitterFFA(
        issue.creator.pubkey,
        issue.creator.pubkey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_ISSUE_API_ROUTE}`,
        { accountId: user.uuid, issueId: issue.uuid, isApprovedSubmitter: true }
      );
    } else {
      axios.post(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_ISSUE_API_ROUTE}`,
        { accountId: user.uuid, issueId: issue.uuid }
      );
    }

    axios.put(`${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/state`, {
      uuid: issue.uuid,
      state: IssueState.IN_PROGRESS,
    });

    setIssue({
      ...issue,
      state: IssueState.IN_PROGRESS,
    });
  };

  return (
    <button onClick={() => requestToSubmit()}>{`${
      issue.creator.uuid === user.uuid
        ? "Allow yourself to submit"
        : "Apply to submit"
    }`}</button>
  );
};

export default RequestToSubmit;

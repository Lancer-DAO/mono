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
  cancelFFA,
  removeSubmitterFFA,
  voteToCancelFFA,
} from "@/src/onChain";

export type SubmitterSectionType = "approved" | "requested";

const VoterSection: React.FC = () => {
  const { issue, wallet, anchor, program, user, setIssue } = useLancer();
  if (user.uuid === issue.creator.uuid && !issue.submitter) {
    const cancelEscrow = async () => {
      cancelFFA(
        issue.creator.pubkey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );

      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/state`,
        {
          uuid: issue.uuid,
          state: IssueState.CANCELED,
        }
      );
      setIssue({
        ...issue,
        state: IssueState.CANCELED,
      });
    };

    return (
      <div>
        <button onClick={() => cancelEscrow()}>{"Cancel Bounty"}</button>
      </div>
    );
  }

  const handleVote = async () => {
    if (user.uuid === issue.creator.uuid) {
      voteToCancelFFA(
        issue.creator.pubkey,
        issue.creator.pubkey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
    } else {
      voteToCancelFFA(
        issue.creator.pubkey,
        user.publicKey,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
    }
  };

  return (
    <div>
      <button onClick={() => handleVote()}>{"Vote to Cancel"}</button>
    </div>
  );
};

export default VoterSection;

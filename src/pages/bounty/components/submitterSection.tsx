import {
  ACCOUNT_ISSUE_API_ROUTE,
  DATA_API_ROUTE,
} from "@/server/src/constants";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useLancer } from "@/src/providers/lancerProvider";
import { Submitter } from "@/src/types";
import { addSubmitterFFA, removeSubmitterFFA } from "@/src/onChain";

export type SubmitterSectionType = "approved" | "requested";
interface SubmitterSectionProps {
  submitter: Submitter;
  type: SubmitterSectionType;
}

const SubmitterSection: React.FC<SubmitterSectionProps> = ({
  submitter,
  type,
}: SubmitterSectionProps) => {
  const { issue, wallet, anchor, program } = useLancer();

  const handleSubmitter = async () => {
    switch (type) {
      case "approved":
        {
          try {
            await removeSubmitterFFA(
              issue.creator.pubkey,
              submitter.pubkey,
              issue.escrowContract,
              wallet,
              anchor,
              program
            );
            axios.put(
              `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_ISSUE_API_ROUTE}`,
              {
                issueId: issue.uuid,
                accountId: submitter.uuid,
                isApprovedSubmitter: false,
              }
            );
          } catch (e) {
            console.error(e);
          }
        }
        break;
      case "requested":
        {
          try {
            await addSubmitterFFA(
              issue.creator.pubkey,
              submitter.pubkey,
              issue.escrowContract,
              wallet,
              anchor,
              program
            );
            axios.put(
              `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_ISSUE_API_ROUTE}`,
              {
                issueId: issue.uuid,
                accountId: submitter.uuid,
                isApprovedSubmitter: true,
              }
            );
          } catch (e) {
            console.error(e);
          }
        }
        break;
    }
  };

  return (
    <div>
      <div>{submitter.githubLogin}</div>
      <button onClick={() => handleSubmitter()}>
        {type === "approved"
          ? `Remove Submission Permissions`
          : "Allow Submissions"}
      </button>
    </div>
  );
};

export default SubmitterSection;

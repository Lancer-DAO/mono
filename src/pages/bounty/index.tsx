import { useEffect, useState } from "react";
import { Issue, IssueState } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { DEVNET_USDC_MINT } from "@/src/constants/web3";
import axios from "axios";
import {
  getApiEndpointExtenstion,
  getMintName,
  getUniqueItems,
} from "@/src/utils";
import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { useRouter } from "next/router";
import Bounty from "@/src/pages/bounty/bounty";

const getIssue = (uuid: string) =>
  axios.get(
    `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}?id=${uuid}`
  );

function App() {
  const router = useRouter();
  const { id } = router.query;
  const [issue, setIssue] = useState();
  useEffect(() => {
    if (id !== undefined) {
      getIssue(id as string).then((response) => {
        const rawIssue = response.data;
        const issue = {
          ...rawIssue,
          hash: rawIssue.funding_hash,
          amount: parseFloat(rawIssue.funding_amount),
          pullNumber: rawIssue.pull_number,
          issueNumber: rawIssue.issue_number,
          githubId: rawIssue.github_id,
          payoutHash: rawIssue.payout_hash,
          author: rawIssue.github_login,
          pubkey: rawIssue.solana_pubkey,
          estimatedTime: parseFloat(rawIssue.estimated_time),
          mint: rawIssue.funding_mint
            ? new PublicKey(rawIssue.funding_mint)
            : undefined,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Blandit libero volutpat sed cras ornare. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget arcu. A erat nam at lectus urna. Mattis aliquam faucibus purus in massa tempor. A lacus vestibulum sed arcu. Id venenatis a condimentum vitae sapien. Eu lobortis elementum nibh tellus molestie nunc non blandit. Massa sapien faucibus et molestie. Sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque eu. Dis parturient montes nascetur ridiculus mus mauris vitae. Tortor posuere ac ut consequat semper viverra nam.",
        };
        console.log("issue", issue);
        setIssue(issue);
      });
    }
  }, [id]);
  return issue && <Bounty issue={issue} />;
}

export default App;

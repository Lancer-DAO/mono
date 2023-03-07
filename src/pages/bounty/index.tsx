import { useEffect, useState } from "react";
import { Issue, IssueState, Submitter } from "@/types";
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
import {
  APP_CONFIG_TYPE,
  CHAIN_CONFIG_TYPE,
  WEB3AUTH_NETWORK_TYPE,
} from "@/src/config";
import { Web3AuthProvider } from "@/src/providers";
import { LancerProvider, useLancer } from "@/src/providers/lancerProvider";
import { getFeatureFundingAccount } from "@/src/onChain";

const getIssue = (uuid: string) =>
  axios.get(
    `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}?id=${uuid}`
  );

const getAccounts = (uuid: string) =>
  axios.get(
    `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/accounts?id=${uuid}`
  );

function App() {
  const router = useRouter();
  const { id } = router.query;
  const [issue, setIssue] = useState<Issue>();
  useEffect(() => {
    const queryIssue = async () => {
      try {
        const issueResponse = await getIssue(id as string);

        const rawIssue = issueResponse.data;
        const issue: Issue = {
          ...rawIssue,
          hash: rawIssue.funding_hash,
          amount: parseFloat(rawIssue.funding_amount),
          pullNumber: rawIssue.pull_number,
          issueNumber: rawIssue.issue_number,
          githubId: rawIssue.github_id,
          payoutHash: rawIssue.payout_hash,
          authorGithub: rawIssue.github_login,
          pubkey: rawIssue.solana_pubkey,
          escrowKey: rawIssue.escrow_key && new PublicKey(rawIssue.escrow_key),
          estimatedTime: parseFloat(rawIssue.estimated_time),
          mint: rawIssue.funding_mint
            ? new PublicKey(rawIssue.funding_mint)
            : undefined,
          timestamp: rawIssue.unix_timestamp,
          description:
            rawIssue.description ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Blandit libero volutpat sed cras ornare. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget arcu. A erat nam at lectus urna. Mattis aliquam faucibus purus in massa tempor. A lacus vestibulum sed arcu. Id venenatis a condimentum vitae sapien. Eu lobortis elementum nibh tellus molestie nunc non blandit. Massa sapien faucibus et molestie. Sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque eu. Dis parturient montes nascetur ridiculus mus mauris vitae. Tortor posuere ac ut consequat semper viverra nam.",
        };
        console.log("issue", issue);
        // setIssue(issue);
        const accountsResponse = await getAccounts(id as string);
        const rawAccounts = accountsResponse.data;
        const accounts: Submitter[] = rawAccounts.map((account) => {
          return {
            ...account,
            githubLogin: account.github_login,
            githubId: account.github_id,
            pubkey: new PublicKey(account.solana_pubkey),
            isCreator: !!account.is_creator,
            isSubmitter: !!account.is_submitter,
            isApprovedSubmitter: !!account.is_approved_submitter,
          };
        });
        const newIssue = {
          ...issue,
          creator: accounts.find((submitter) => submitter.isCreator),
          submitter: accounts.find((submitter) => submitter.isSubmitter),
          approvedSubmitters: accounts.filter(
            (submitter) => submitter.isApprovedSubmitter
          ),
          requestedSubmitters: accounts.filter(
            (submitter) =>
              !(
                submitter.isApprovedSubmitter ||
                submitter.isSubmitter ||
                submitter.isCreator
              )
          ),
        };
        setIssue(newIssue);
      } catch (e) {
        console.error(e);
      }
    };
    if (id !== undefined) {
      queryIssue();
    }
  }, [id]);
  return (
    issue && (
      <LancerProvider referrer={`bounty?id=${id}`} issueProp={issue}>
        <Bounty />
      </LancerProvider>
    )
  );
}

export default App;

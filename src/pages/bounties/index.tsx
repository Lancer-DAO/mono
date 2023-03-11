import { IssueList } from "./bountyTable";
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

const getIssues = () =>
  axios.get(
    `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}s`
  );

function App() {
  const [issues, setIssues] = useState();
  const [tags, setTags] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<string[]>([]);
  const [bounds, setTimeBounds] = useState<[number, number]>([0, 10]);
  useEffect(() => {
    getIssues().then((response) => {
      const issues = response.data.map((rawIssue) => {
        return {
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
          description: rawIssue.description
            ? rawIssue.description
            : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Blandit libero volutpat sed cras ornare. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget arcu. A erat nam at lectus urna. Mattis aliquam faucibus purus in massa tempor. A lacus vestibulum sed arcu. Id venenatis a condimentum vitae sapien. Eu lobortis elementum nibh tellus molestie nunc non blandit. Massa sapien faucibus et molestie. Sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque eu. Dis parturient montes nascetur ridiculus mus mauris vitae. Tortor posuere ac ut consequat semper viverra nam.",
        };
      });
      setIssues(issues);
      const allTags = issues
        .map((issue) => issue.tags)
        .reduce(
          (accumulator, currentValue) => [
            ...accumulator,
            ...(currentValue ? currentValue : []),
          ],
          []
        );
      setTags(getUniqueItems(allTags));
      setOrgs(getUniqueItems(issues.map((issue) => issue.org)));
      setMints(getUniqueItems(issues.map((issue) => getMintName(issue.mint))));
      const allTimes = issues.map((issue) => issue.estimatedTime);
      const maxTime = Math.max(...allTimes) || 10;
      const minTime = Math.min(...allTimes) || 0;
      setTimeBounds([minTime, maxTime === minTime ? maxTime + 1 : maxTime]);
    });
  }, []);
  return (
    issues && (
      <div>
        <h1 className="page-header">Bounties</h1>
        <IssueList
          issues={issues}
          mints={mints}
          orgs={orgs}
          tags={tags}
          timeBounds={bounds}
        />
      </div>
    )
  );
}

export default App;

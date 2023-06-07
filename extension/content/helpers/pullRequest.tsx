import * as ReactDOM from "react-dom/client";
import { PullRequest } from "../components/pullRequest";

import axios, { AxiosResponse } from "axios";
import { Issue } from "../types";
import { getExtensionEndpoint } from "../utils";
const AUTHOR_SELECTOR = ".author.text-bold.Link--secondary";
const TITLE_SELECTOR = ".js-issue-title.markdown-title";
const WRAPPER_CLASSNAME = "discussion-sidebar-item js-discussion-sidebar-item";

const issueSelector = ".issue-link.js-issue-link";
const assigneeSelector =
  ".discussion-sidebar-item.sidebar-assignee.js-discussion-sidebar-item";

// actually insert the component in the page
const insertPR = (response, endpoint) => {
  const assigneeEle = window.document.querySelectorAll(assigneeSelector)[0];
  if (assigneeEle && response.data) {
    const pullRequestRaw = response.data;
    const issue: Issue = {
      ...pullRequestRaw,
      issueNumber: pullRequestRaw.issue_number,
      pullNumber: pullRequestRaw.pull_number,
      amount: parseFloat(pullRequestRaw.funding_amount),
      hash: pullRequestRaw.funding_hash,
      githubId: pullRequestRaw.github_id,
      payoutHash: pullRequestRaw.payout_hash,
      author: pullRequestRaw.github_login,
    };
    const fundingWrapper = window.document.createElement("div");
    fundingWrapper.className = WRAPPER_CLASSNAME;
    assigneeEle.insertAdjacentElement("afterend", fundingWrapper);
    const fundingInner = ReactDOM.createRoot(fundingWrapper);
    fundingInner.render(<PullRequest issue={issue} endpoint={endpoint} />);
  }
};

const maybeGetPR = (splitURL, issueNumber, author, endpoint) =>
  axios.post(`${endpoint}/api/trpc/pullRequests.createPullRequest?batch=1`, {
    0: {
      json: {
        organizationName: splitURL[3],
        repositoryName: splitURL[4],
        pullNumber: parseInt(splitURL[6]),
        issueNumber: parseInt(issueNumber),
        githubLogin: author,
      },
    },
  });

// Check if this PR is closing an Issue linked to lancer. If so, either
// - get a link to that lancer issue and provide it
// - create a PR in the lancer backend and link it to the lancer issue
export const insertPullRequest = (splitURL: string[]) => {
  const port = chrome.runtime.connect({ name: "contentScript" });
  port.postMessage({ message: "getEnvironment" });
  port.onMessage.addListener(function (msg) {
    if (msg.message === "environment") {
      const endpoint = getExtensionEndpoint(msg.environment);
      const issueNumber = window.document
        .querySelectorAll(issueSelector)[0]
        ?.innerHTML?.split("#")[1];
      const existingWrapper = window.document.querySelector(
        `.${WRAPPER_CLASSNAME}`
      );

      const author = window.document.querySelector(
        `${AUTHOR_SELECTOR}`
      ).innerHTML;
      if (issueNumber && !existingWrapper) {
        maybeGetPR(splitURL, issueNumber, author, endpoint).then(
          (response: AxiosResponse<any, any>) => {
            insertPR(response, endpoint);
          }
        );
      }
    }
  });
};

export {};

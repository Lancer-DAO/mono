import * as ReactDOM from "react-dom/client";
import { PullRequest } from "../components/pullRequest";

import axios, { AxiosResponse } from "axios";
import {
  DATA_API_ROUTE,
  NEW_PULL_REQUEST_API_ROUTE,
  FULL_PULL_REQUEST_API_ROUTE,
} from "@/server/src/constants";
import { getApiEndpointExtension } from "../utils";
import { Issue } from "../types";
const AUTHOR_SELECTOR = ".author.text-bold.Link--secondary";
const TITLE_SELECTOR = ".js-issue-title.markdown-title";

const WRAPPER_CLASSNAME = "funded-issue-wrapper";

const issueSelector = ".issue-link.js-issue-link";
const assigneeSelector =
  ".discussion-sidebar-item.sidebar-assignee.js-discussion-sidebar-item";

const insertPR = (response) => {
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
    fundingInner.render(<PullRequest issue={issue} />);
  }
};

const maybeGetPR = (splitURL, issueNumber, author) =>
  axios.get(
    `${getApiEndpointExtension()}${DATA_API_ROUTE}/${FULL_PULL_REQUEST_API_ROUTE}`,
    {
      params: {
        org: splitURL[3],
        repo: splitURL[4],
        pullNumber: splitURL[6],
        issueNumber: issueNumber,
        githubLogin: author,
      },
    }
  );

export const insertPullRequest = (splitURL: string[]) => {
  const issueNumber = window.document
    .querySelectorAll(issueSelector)[0]
    ?.innerHTML?.split("#")[1];
  const existingWrapper = window.document.querySelector(
    `.${WRAPPER_CLASSNAME}`
  );

  const author = window.document.querySelector(`${AUTHOR_SELECTOR}`).innerHTML;
  const title = window.document.querySelector(`${TITLE_SELECTOR}`).innerHTML;
  if (issueNumber && !existingWrapper) {
    maybeGetPR(splitURL, issueNumber, author).then(
      (response: AxiosResponse<any, any>) => {
        if (response.data.message === "NOT FOUND") {
          axios
            .post(
              `${getApiEndpointExtension()}${DATA_API_ROUTE}/${NEW_PULL_REQUEST_API_ROUTE}`,
              {
                org: splitURL[3],
                repo: splitURL[4],
                pullNumber: splitURL[6],
                issueNumber: issueNumber,
                githubLogin: author,
                title: title,
              }
            )
            .then(() => {
              maybeGetPR(splitURL, issueNumber, author).then((response) =>
                insertPR(response)
              );
            });
        } else {
          insertPR(response);
        }
      }
    );
  }
};

export {};

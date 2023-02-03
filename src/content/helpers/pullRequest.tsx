import * as ReactDOM from "react-dom/client";
import { IssueState } from "@/types";
import { PullRequest } from "@/components";

import axios, { AxiosResponse } from "axios";
import {
  DATA_API_ROUTE,
  PULL_REQUEST_API_ROUTE,
  NEW_PULL_REQUEST_API_ROUTE,
  FULL_PULL_REQUEST_API_ROUTE,
} from "@/server/src/constants";
import { convertToQueryParams, getApiEndpointExtenstion } from "@/utils";
const AUTHOR_SELECTOR = ".author.text-bold.Link--secondary";

const WRAPPER_CLASSNAME = "funded-issue-wrapper";

const issueSelector = ".issue-link.js-issue-link";
const assigneeSelector =
  ".discussion-sidebar-item.sidebar-assignee.js-discussion-sidebar-item";

const insertPR = (response) => {
  const assigneeEle = window.document.querySelectorAll(assigneeSelector)[0];
  if (assigneeEle && response.data) {
    const pullRequestRaw = response.data;
    const issue = {
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
    `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${FULL_PULL_REQUEST_API_ROUTE}?${convertToQueryParams(
      {
        org: splitURL[3],
        repo: splitURL[4],
        pullNumber: splitURL[6],
        issueNumber: issueNumber,
        githubLogin: author,
      }
    )}`
  );

export const insertPullRequest = (splitURL: string[]) => {
  const issueNumber = window.document
    .querySelectorAll(issueSelector)[0]
    ?.innerHTML?.split("#")[1];
  const existingWrapper = window.document.querySelector(
    `.${WRAPPER_CLASSNAME}`
  );

  const author = window.document.querySelector(`${AUTHOR_SELECTOR}`).innerHTML;
  if (issueNumber && !existingWrapper) {
    maybeGetPR(splitURL, issueNumber, author).then(
      (response: AxiosResponse<any, any>) => {
        if (response.data.message === "NOT FOUND") {
          axios
            .post(
              `${getApiEndpointExtenstion()}${DATA_API_ROUTE}/${NEW_PULL_REQUEST_API_ROUTE}?${convertToQueryParams(
                {
                  org: splitURL[3],
                  repo: splitURL[4],
                  pullNumber: splitURL[6],
                  issueNumber: issueNumber,
                  githubLogin: author,
                }
              )}`
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

import * as ReactDOM from "react-dom/client";
import { ExistingIssueFunds } from "@/components";
import axios, { AxiosResponse } from "axios";
import { API_ENDPOINT } from "@/constants";
import {
  DATA_API_ROUTE,
  FULL_PULL_REQUEST_API_ROUTE,
  ISSUE_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { convertToQueryParams } from "@/utils";
import { Issue } from "@/types";
const WRAPPER_CLASSNAME = "funded-issue-wrapper";
const assigneeSelector =
  ".discussion-sidebar-item.sidebar-assignee.js-discussion-sidebar-item";
const linkedPRSelector = ".Link--primary.f4.text-bold.markdown-title";
const innerPRSpanSelector = ".color-fg-muted.text-normal";
const authorSelector = ".author.Link--primary.text-bold";

const maybeGetPR = (splitURL, pullNumber, author) =>
  axios.get(
    `${API_ENDPOINT}${DATA_API_ROUTE}/${FULL_PULL_REQUEST_API_ROUTE}?${convertToQueryParams(
      {
        org: splitURL[3],
        repo: splitURL[4],
        pullNumber: pullNumber,
        issueNumber: splitURL[6],
        githubLogin: author,
      }
    )}`
  );

export const insertIssue = (response, splitURL) => {
  const assigneeEle = window.document.querySelectorAll(assigneeSelector)[0];
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
  };
  if (assigneeEle) {
    const fundingWrapper = window.document.createElement("div");
    fundingWrapper.className = WRAPPER_CLASSNAME;
    assigneeEle.insertAdjacentElement("afterend", fundingWrapper);
    const fundingInner = ReactDOM.createRoot(fundingWrapper);
    fundingInner.render(<ExistingIssueFunds issue={issue} />);
    if (issue?.issueNumber === undefined) {
      const newIssue = {
        issueNumber: splitURL[6],
        ...issue,
      };
      delete newIssue.state;
      axios.put(
        `${API_ENDPOINT}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}?${convertToQueryParams(
          newIssue
        )}`
      );
    }
  }
};

export const insertExistingIssue = (splitURL: string[]) => {
  const existingWrapper = window.document.querySelector(
    `.${WRAPPER_CLASSNAME}`
  );
  if (!existingWrapper) {
    const issueTitle = window.document.querySelectorAll(
      ".js-issue-title.markdown-title"
    )[0].innerHTML;
    const prNumberRaw = window.document
      .querySelectorAll(linkedPRSelector)[0]
      .querySelector(innerPRSpanSelector)
      .innerHTML.split("#")[1];
    const author = window.document.querySelector(authorSelector).innerHTML;
    maybeGetPR(splitURL, parseInt(prNumberRaw), author).then((resp) => {
      if (resp.data.message === "NOT FOUND") {
        axios
          .get(
            `${API_ENDPOINT}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}?${convertToQueryParams(
              {
                org: splitURL[3],
                repo: splitURL[4],
                title: issueTitle,
              }
            )}`
          )
          .then((response: AxiosResponse<any, any>) => {
            insertIssue(response, splitURL);
          });
      } else {
        insertIssue(resp, splitURL);
      }
    });
  }
};

import * as ReactDOM from "react-dom/client";
import { IssueState } from "@/types";
import { PullRequest } from "@/components";
const WRAPPER_CLASSNAME = "funded-issue-wrapper";

export const insertPullRequest = (splitURL: string[]) => {
  const issueSelector = ".issue-link.js-issue-link";
  const assigneeSelector =
    ".discussion-sidebar-item.sidebar-assignee.js-discussion-sidebar-item";

  const repoName = `${splitURL[3]}.${splitURL[4]}`;
  const issueNumber = window.document
    .querySelectorAll(issueSelector)[0]
    ?.innerHTML?.split("#")[1];
  const existingWrapper = window.document.querySelector(
    `.${WRAPPER_CLASSNAME}`
  );
  if (issueNumber && !existingWrapper) {
    chrome.runtime.sendMessage(
      {
        message: "get_issue_funding",
        repo: repoName,
        issueNumber: issueNumber,
      },
      (response) => {
        const assigneeEle =
          window.document.querySelectorAll(assigneeSelector)[0];
        if (assigneeEle && response.issue) {
          const fundingWrapper = window.document.createElement("div");
          fundingWrapper.className = WRAPPER_CLASSNAME;
          assigneeEle.insertAdjacentElement("afterend", fundingWrapper);
          const fundingInner = ReactDOM.createRoot(fundingWrapper);
          fundingInner.render(<PullRequest issueProp={response.issue} />);
          if (response.issue.state === IssueState.NEW) {
            const newIssue = {
              ...response.issue,
              state: IssueState.IN_PROGRESS,
            };
            chrome.runtime.sendMessage({
              message: "update_issue_info",
              issue: newIssue,
            });
          }
        }
      }
    );
  }
};

export {};

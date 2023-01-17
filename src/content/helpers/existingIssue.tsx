import * as ReactDOM from "react-dom/client";
import { ExistingIssueFunds } from "@/components";
const WRAPPER_CLASSNAME = "funded-issue-wrapper";
const assigneeSelector =
  ".discussion-sidebar-item.sidebar-assignee.js-discussion-sidebar-item";
export const insertExistingIssue = (splitURL: string[]) => {
  const existingWrapper = window.document.querySelector(
    `.${WRAPPER_CLASSNAME}`
  );
  if (!existingWrapper) {
    const repoName = `${splitURL[3]}.${splitURL[4]}`;
    const issueTitle = window.document.querySelectorAll(
      ".js-issue-title.markdown-title"
    )[0].innerHTML;
    chrome.runtime.sendMessage(
      {
        message: "get_issue_funding",
        repo: repoName,
        title: issueTitle,
      },
      (response) => {
        const assigneeEle =
          window.document.querySelectorAll(assigneeSelector)[0];
        if (assigneeEle) {
          const fundingWrapper = window.document.createElement("div");
          fundingWrapper.className = WRAPPER_CLASSNAME;
          assigneeEle.insertAdjacentElement("afterend", fundingWrapper);
          const fundingInner = ReactDOM.createRoot(fundingWrapper);
          fundingInner.render(<ExistingIssueFunds issue={response.issue} />);
          if (response.issue?.issueNumber === undefined) {
            const newIssue = {
              issueNumber: splitURL[6],
              ...response.issue,
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

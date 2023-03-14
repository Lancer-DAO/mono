import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { FundIssue } from "../components/fundIssue";
const WRAPPER_CLASSNAME = "fund-issue-wrapper";

export const insertFund = () => {
  window.name = "extension-window";

  // github issue
  const titleSelector =
    ".mb-3.p-0.p-md-2.mb-md-0.rounded-top-2.color-bg-default";
  const titleInputEle = window.document.querySelectorAll(titleSelector)[0];
  const existingWrapper = window.document.querySelector(
    `.${WRAPPER_CLASSNAME}`
  );

  if (titleInputEle && !existingWrapper) {
    const fundingWrapper = window.document.createElement("div");
    fundingWrapper.className = WRAPPER_CLASSNAME;
    titleInputEle.insertAdjacentElement("beforeend", fundingWrapper);
    const fundingInner = ReactDOM.createRoot(fundingWrapper);
    fundingInner.render(<FundIssue />);
  }
};

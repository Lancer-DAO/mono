import { Web3Provider } from "@/providers";
import { useEffect, useState } from "react";
import { FundingSplit } from "@/components";
import { Issue } from "@/src/types";

export type ContributorCompensationInfo = {
  pubkey: string;
  name: string;
  picture: string;
  amount: number;
  signature?: string;
};

export enum IssueState {
  NEW = "new",
  IN_PROGRESS = "in_progress",
  AWAITING_REVIEW = "awaiting_review",
  APPROVED = "approved",
  COMPLETE = "complete",
  CANCELED = "canceled",
}

export enum IssueType {
  BUG = "bug",
  DOCUMENTATION = "documentation",
  TEST = "test",
  FEATURE = "feature",
}

const ModalApp = () => {
  const [issue, setIssue] = useState<Issue>();
  const [popupType, setPopupType] = useState<string>();
  var port = chrome.runtime.connect({ name: "popup" });
  useEffect(() => {
    port.postMessage({ request: "funding_data" });
    port.onMessage.addListener(function (msg) {
      setIssue(msg.issue);
      setPopupType(msg.popupType);
    });
  }, []);
  if (issue && popupType) {
    <Web3Provider issue={issue} port={port} popup={popupType} />;
  }
  return <div>hi</div>;
};
export default ModalApp;

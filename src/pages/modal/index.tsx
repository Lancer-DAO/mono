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
  return <div>hi</div>;
};
export default ModalApp;

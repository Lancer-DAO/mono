import { PublicKey } from "@solana/web3.js";

export type Issue = {
    amount: number;
    hash?: string;
    title: string;
    issueNumber?: string;
    repo: string;
    org: string;
    paid?: boolean;
    state: IssueState;
    type?: IssueType;
    author?: string;
    pubkey?: string;
    pullNumber?: number;
    githubId?: string;
    payoutHash?: string;
    mint?: PublicKey;
    tags: string[];
    estimatedTime: number;
    description?: string;
    uuid?: string;
    escrowKey?: string;
  };


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
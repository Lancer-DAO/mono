import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { Program } from "@project-serum/anchor";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";

export type Submitter = {
  githubLogin: string
  githubId: string
  pubkey: PublicKey
  uuid: string
  account: string
  isCreator: boolean
  isSubmitter: boolean
  isApprovedSubmitter: boolean
}

export type EscrowContract = {
  approvedSubmitters: PublicKey [];
  creator: PublicKey;
  currentSubmitter: PublicKey;
  funderCancel: boolean;
  fundsDataAccountBump: number;
  fundsMint: PublicKey;
  fundsTokenAccount: PublicKey;
  fundsTokenAccountBump: number;
  noOfSubmitters: number;
  payoutAccount: PublicKey;
  payoutCancel: boolean;
  programAuthorityBump: number;
  requestSubmitter: boolean;
  unixTimestamp: string;
}

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
    escrowKey?: PublicKey;
    timestamp?:string;
    creator?: Submitter;
    submitter?: Submitter;
    approvedSubmitters?: Submitter[];
    requestedSubmitters?: Submitter[];
    escrowContract: EscrowContract
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
    FUNDED = "funded",
    ACCEPTING_APPLICATIONS = "accepting_applications",
    IN_PROGRESS = "in_progress",
    AWAITING_REVIEW = "awaiting_review",
    COMPLETE = "complete",
    VOTING_TO_CANCEL = "voting_to_cancel",
    CANCELED = "canceled",
  }

  export enum IssueType {
    BUG = "bug",
    DOCUMENTATION = "documentation",
    TEST = "test",
    FEATURE = "feature",
  }
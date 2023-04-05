import { PublicKey } from "@solana/web3.js";
import * as Prisma from "@prisma/client";
import { OAuthExtension, OAuthRedirectResult } from "@magic-ext/oauth";
import { SolanaExtension } from "@magic-ext/solana";
import { SDKBase, InstanceWithExtensions, MagicSDKExtensionsOption } from '@magic-sdk/provider';

export enum ISSUE_ACCOUNT_RELATIONSHIP {
  Creator = 'creator',
  RequestedSubmitter = 'requested_submitter',
  DeniedRequester = 'denied_requester',
  ApprovedSubmitter = 'approved_submitter',
  CurrentSubmitter = 'current_submitter',
  DeniedSubmitter = 'denied_submitter',
  ChangesRequestedSubmitter = 'changes_requested_submitter',
  Completer = 'completer',
  VotingCancel = 'voting_cancel'
}

export interface Contributor extends User  {
  relations: ISSUE_ACCOUNT_RELATIONSHIP[];
}

export interface Bounty extends Prisma.Bounty {

  escrow: Escrow;
  repository: Repository;
  issue: Issue;
  tags: Tag[];
  creator?: User;
  contributors?: User[];
  transactions?: Transaction[];
}

export interface Tag extends Prisma.Tag {

}

export interface Transaction extends Prisma.Transaction {

}

export interface Escrow extends Prisma.Escrow {

}

export interface Repository extends Prisma.Repository {

}

export interface User extends Prisma.User  {
  isCreator?: boolean,
  isRequestedSubmitter?: boolean,
  isDeniedRequester?: boolean,
  isApprovedSubmitter?: boolean,
  isCurrentSubmitter?: boolean,
  isDeniedSubmitter?: boolean,
  isChangesRequestedSubmitter?: boolean,
  isCompleter?: boolean,
  isVotingCancel?: boolean
  repos?: any[];
  relations?: ISSUE_ACCOUNT_RELATIONSHIP[];
}
export declare type Magic<T extends MagicSDKExtensionsOption<any> = MagicSDKExtensionsOption> = InstanceWithExtensions<SDKBase, T>;

export interface CurrentUser extends User  {
  magic: OAuthRedirectResult | InstanceWithExtensions<SDKBase, (OAuthExtension | SolanaExtension)[]>,
  isCreator?: boolean,
  isRequestedSubmitter?: boolean,
  isDeniedRequester?: boolean,
  isApprovedSubmitter?: boolean,
  isCurrentSubmitter?: boolean,
  isDeniedSubmitter?: boolean,
  isChangesRequestedSubmitter?: boolean,
  isCompleter?: boolean,
  isVotingCancel?: boolean
  repos?: any[];
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

export interface Issue extends Prisma.Issue  {
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
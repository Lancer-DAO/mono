import { PublicKey } from "@solana/web3.js";
import * as Prisma from "@prisma/client";
import { OAuthExtension, OAuthRedirectResult } from "@magic-ext/oauth";
import { SolanaExtension } from "@magic-ext/solana";
import { SDKBase, InstanceWithExtensions, MagicSDKExtensionsOption } from '@magic-sdk/provider';

export enum BOUNTY_USER_RELATIONSHIP {
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

export interface Contributor extends Omit<(Prisma.BountyUser & {
  user: Prisma.User;
}), "relations">  {
  relations: BOUNTY_USER_RELATIONSHIP[];
  publicKey: string;
}

export interface Bounty extends Omit<Prisma.Bounty, "creator">, BountyUserRelations,  CurrentUserBountyInclusions{

  escrow: Escrow;
  repository: Repository;
  issue: Issue;
  tags: Tag[];
  pullRequests: PullRequest[];
  wallets: Wallet[]
  currentUserRelationsList: BOUNTY_USER_RELATIONSHIP[];
}

export interface Tag extends Prisma.Tag {

}

export interface Wallet extends Prisma.Wallet{}

export interface Transaction extends Prisma.Transaction {
  wallets: Prisma.TransactionWallet[]
}

export interface Escrow extends Prisma.Escrow {
  transactions: Transaction[]
}

export interface Repository extends Prisma.Repository {

}

export interface PullRequest extends Prisma.PullRequest {

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
  isVotingCancel?: boolean;
  repos?: any[];
  relations?: BOUNTY_USER_RELATIONSHIP[];
  wallets: Wallet[];
  currentWallet: Wallet;
}
export declare type Magic<T extends MagicSDKExtensionsOption<any> = MagicSDKExtensionsOption> = InstanceWithExtensions<SDKBase, T>;

export interface CurrentUser extends User  {
  magic: OAuthRedirectResult | InstanceWithExtensions<SDKBase, (OAuthExtension | SolanaExtension)[]>,

  repos?: any[];
}

export interface CurrentUserBountyInclusions {
  isCreator?: boolean,
  isRequestedSubmitter?: boolean,
  isDeniedRequester?: boolean,
  isApprovedSubmitter?: boolean,
  isCurrentSubmitter?: boolean,
  isDeniedSubmitter?: boolean,
  isChangesRequestedSubmitter?: boolean,
  isCompleter?: boolean,
  isVotingCancel?: boolean
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

  export interface BountyUserRelations {
    all?: Contributor[],
    creator: Contributor,
    requestedSubmitters?: Contributor[],
    deniedRequesters?: Contributor[],
    approvedSubmitters?: Contributor[],
    currentSubmitter?: Contributor,
    changesRequestedSubmitters?: Contributor[],
    deniedSubmitters?: Contributor[],
    completer?: Contributor,
    needsToVote?: Contributor[],
    votingToCancel?: Contributor[],
  }

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
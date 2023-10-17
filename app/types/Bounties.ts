import {
  BountyPreviewType,
  BountyUserType,
  UserPreviewType,
} from "@/prisma/queries/bounty";
import { BountyType } from "@/prisma/queries/bounty";
import { UserType, UserSearchType } from "@/prisma/queries/user";
import { WalletType } from "@/prisma/queries/wallet";
import { IndustryType } from "@/prisma/queries/industry";
import { MediaType } from "@/prisma/queries/media";
import { MintType } from "@/prisma/queries/mint";

export type Filters = {
  industries: string[];
  tags: string[];
  states: string[];
};

export enum BOUNTY_USER_RELATIONSHIP {
  Creator = "creator",
  RequestedLancer = "requested_lancer",
  ShortlistedLancer = "shortlisted_lancer",
  DeniedLancer = "denied_lancer",
  ApprovedSubmitter = "approved_submitter",
  CurrentSubmitter = "current_submitter",
  DeniedSubmitter = "denied_submitter",
  ChangesRequestedSubmitter = "changes_requested_submitter",
  Completer = "completer",
  VotingCancel = "voting_cancel",
  Disputer = "disputer",
  DisputeHandler = "dispute_handler",
  Canceler = "canceler",
}
export const RELATIONS = Object.values(BOUNTY_USER_RELATIONSHIP);

export interface CurrentUserBountyInclusions {
  isCreator?: boolean;
  isRequestedLancer?: boolean;
  isShortlistedLancer?: boolean;
  isDeniedLancer?: boolean;
  isApprovedSubmitter?: boolean;
  isCurrentSubmitter?: boolean;
  isDeniedSubmitter?: boolean;
  isChangesRequestedSubmitter?: boolean;
  isCompleter?: boolean;
  isVotingCancel?: boolean;
}
export interface BountyUserRelations {
  all?: BountyUserType[];
  creator: BountyUserType;
  requestedLancers?: BountyUserType[];
  shortlistedLancers?: BountyUserType[];
  deniedLancers?: BountyUserType[];
  approvedSubmitters?: BountyUserType[];
  currentSubmitter?: BountyUserType;
  changesRequestedSubmitters?: BountyUserType[];
  deniedSubmitters?: BountyUserType[];
  completer?: BountyUserType;
  needsToVote?: BountyUserType[];
  votingToCancel?: BountyUserType[];
  disputer?: BountyUserType;
}

export enum BountyState {
  ACCEPTING_APPLICATIONS = "accepting_applications",
  IN_PROGRESS = "in_progress",
  COMPLETE = "complete",
  CANCELED = "canceled",
  ACH_PENDING = "ach_pending",
  AWAITING_REVIEW = "awaiting_review",
  VOTING_TO_CANCEL = "voting_to_cancel",
  DISPUTE_STARTED = "dispute_started",
  DISPUTE_SETTLED = "dispute_settled",
}

export enum ACHState {
  PRE_INITATION = "PRE_INITATION",
  INITIATED = "INITIATED",
  SUCCESS = "SETTLED",
  RETURNED = "RETURNED",
  FAILED = "FAILED",
}

export const BOUNTY_STATES = Object.values(BountyState);
export const TABLE_BOUNTY_STATES = Object.values(BountyState);

export type Bounty = BountyType;
export type BountyPreview = BountyPreviewType;
export type User = UserType;
export type UserPreview = UserPreviewType;
export type UserSearch = UserSearchType;
export type Wallet = WalletType;
export type Industry = IndustryType;
export type Media = MediaType;
export type Mint = MintType;

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type UnwrapArray<T> = T extends Array<infer U> ? U : T;
export type UserSearchIndividual = UnwrapArray<UserSearch>;
export type Escrow = Bounty["escrow"];
export type Class = "Noble" | "Lancer";

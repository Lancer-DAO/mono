import { BountyPreviewType, BountyUserType } from "@/prisma/queries/bounty";
import { BountyType } from "@/prisma/queries/bounty";
import { UserType, UserSearchType } from "@/prisma/queries/user";
import { WalletType } from "@/prisma/queries/wallet";
import { DisciplineType } from "@/prisma/queries/discipline";
import { IndustryType } from "@/prisma/queries/industry";
import { Mint } from "@prisma/client";

export enum BOUNTY_USER_RELATIONSHIP {
  Creator = "creator",
  RequestedSubmitter = "requested_submitter",
  DeniedRequester = "denied_requester",
  ApprovedSubmitter = "approved_submitter",
  CurrentSubmitter = "current_submitter",
  DeniedSubmitter = "denied_submitter",
  ChangesRequestedSubmitter = "changes_requested_submitter",
  Completer = "completer",
  VotingCancel = "voting_cancel",
  Canceler = "canceler",
}
export interface CurrentUserBountyInclusions {
  isCreator?: boolean;
  isRequestedSubmitter?: boolean;
  isDeniedRequester?: boolean;
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
  requestedSubmitters?: BountyUserType[];
  deniedRequesters?: BountyUserType[];
  approvedSubmitters?: BountyUserType[];
  currentSubmitter?: BountyUserType;
  changesRequestedSubmitters?: BountyUserType[];
  deniedSubmitters?: BountyUserType[];
  completer?: BountyUserType;
  needsToVote?: BountyUserType[];
  votingToCancel?: BountyUserType[];
}

export enum BountyState {
  NEW = "new",
  CANCELED = "canceled",
  COMPLETE = "complete",
  FUNDED = "funded",
  ACCEPTING_APPLICATIONS = "accepting_applications",
  IN_PROGRESS = "in_progress",
  AWAITING_REVIEW = "awaiting_review",
  VOTING_TO_CANCEL = "voting_to_cancel",
}

export type Bounty = BountyType;
export type BountyPreview = BountyPreviewType;
export type User = UserType;
export type UserSearch = UserSearchType;
export type Wallet = WalletType;
export type Discipline = DisciplineType;
export type Industry = IndustryType;

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type UnwrapArray<T> = T extends Array<infer U> ? U : T;
export type UserSearchIndividual = UnwrapArray<UserSearch>;
export type Escrow = Bounty["escrow"];

export type Filters = {
  mints: Mint[];
  orgs: string[];
  industries: Industry[];
  tags: string[];
  states: string[];
  estimatedPriceBounds: [number, number];
  relationships: string[];
  isMyBounties: boolean;
};

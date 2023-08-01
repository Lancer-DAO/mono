import { api } from "@/src/utils/api";
import { BountyUserType } from "@/prisma/queries/bounty";

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

const { mutateAsync: getBounty } = api.bounties.getBounty.useMutation();
const { mutateAsync: getUser } = api.users.getUser.useMutation();
const { mutateAsync: searchUser } = api.users.search.useMutation();

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type UnwrapArray<T> = T extends Array<infer U> ? U : T;
export type Bounty = UnwrapPromise<ReturnType<typeof getBounty>>;
export type User = UnwrapPromise<ReturnType<typeof getUser>>;
export type UserSearch = UnwrapPromise<ReturnType<typeof searchUser>>;
export type UserSearchIndividual = UnwrapArray<UserSearch>;
export type Escrow = Bounty["escrow"];

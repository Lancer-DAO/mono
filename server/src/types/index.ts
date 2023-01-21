import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);

// USER
export interface AccountInsertParams extends AccountGetParams {
  solanaKey: PublicKey;
  verified?: boolean;
  isAdmin?: boolean;
}

export interface AccountGetParams {
  githubId: string;
}

// ISSUE

export interface IssueInsertParams extends IssueGetParams {
fundingHash: string,
fundingAmount: number
}

export interface IssueGetParams {
  title: string,
  repo: string,
  org: string,
  issueNumber?: number
}

export interface IssueUpdateParams extends IssueGetParams {
  state: string
  }


// PULL REQUEST

export interface PullRequestInsertParams extends PullRequestGetParams {
  title: string,
  }

  export interface PullRequestGetParams {
    repo: string,
    org: string,
    pullNumber: number

  }

  export interface LinkPullRequestParams extends PullRequestGetParams, IssueGetParams {}

  // ACCOUNT ISSUE
  export interface AccountIssueGetParams extends AccountGetParams, IssueGetParams {}
  export interface AccountIssueNewParams extends AccountInsertParams, IssueInsertParams {}

// ACCOUNT PULL REQUEST
export interface AccountPullRequestGetParams extends AccountGetParams, PullRequestGetParams {
  amount: number
}
export interface AccountPullRequestNewParams extends AccountInsertParams, PullRequestInsertParams {
  amount: number
}


export interface RaffleParams {
  raffleKey: PublicKey;
  raffleType: RaffleType;
  raffleMint?: PublicKey;
  maxTickets?: number;
  expiration?: dayjs.Dayjs;
  hidden?: boolean;
}

export type RaffleType = "1 of 1" | "Whitelist" | "Edition" | "Commission";

// RAFFLE ENTRY

export interface GetRaffleEntryParams {
  userKey: PublicKey;
  raffleKey: PublicKey;
}

export interface RaffleEntryParams extends GetRaffleEntryParams {
  count: number;
}

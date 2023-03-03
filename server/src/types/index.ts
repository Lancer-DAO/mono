import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);

// USER
export interface AccountInsertParams extends AccountGetParams {
  solanaKey?: PublicKey;
  verified?: boolean;
  isAdmin?: boolean;
  githubId?: string;

}

export interface AccountGetParams {
  githubLogin: string;
}

// ISSUE

export interface IssueInsertParams extends IssueGetParams {
fundingHash: string,
fundingAmount: number,
fundingMint: string,
tags: string[],
private: boolean,
estimatedTime: number,
description: string
}

export interface IssueGetParams {
  title?: string,
  repo: string,
  org: string,
  issueNumber?: number
}

export interface IssueUpdateParams extends IssueGetParams {
  state?: string
  hash?: string
  escrow_key?: string
  }


// PULL REQUEST

export interface PullRequestInsertParams extends PullRequestGetParams {
  title?: string,
  }

  export interface PullRequestGetParams {
    repo: string,
    org: string,
    pullNumber: number

  }

  export interface PullRequestUpdateParams extends PullRequestGetParams{
    payoutHash: string
  }

  export interface NewPullRequestParams extends PullRequestInsertParams, AccountGetParams {
    issueNumber: number
  }

  export interface LinkPullRequestParams extends PullRequestGetParams, IssueGetParams {}

  // ACCOUNT ISSUE
  export interface AccountIssueGetParams extends AccountGetParams, IssueGetParams {}
  export interface AccountIssueNewParams extends AccountInsertParams, IssueInsertParams {}

// ACCOUNT PULL REQUEST
export interface AccountPullRequestGetParams extends AccountGetParams, PullRequestGetParams {
}
export interface AccountPullRequestNewParams extends AccountInsertParams, PullRequestInsertParams {
  amount: number
}

export interface GetFullPullRequest extends LinkPullRequestParams, AccountGetParams {}
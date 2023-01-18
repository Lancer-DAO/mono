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
fundingHash: string
}

export interface IssueGetParams {
  title: string,
  repo: string,
  org: string,
  issueNumber?: number
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

import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);

// USER
export interface UserParams {
  userKey: PublicKey;
  canCreateRaffle?: boolean;
  isAdmin?: boolean;
}

// RAFFLE

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

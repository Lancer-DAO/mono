import { DB } from "../db";
import {
  RaffleEntryParams,
  AccountInsertParams,
  AccountGetParams,
  RaffleParams,
  GetRaffleEntryParams,
} from "../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { TIMESTAMP_FORMAT } from "../constants";
dayjs.extend(timezone);

// USERS

export const insertAccount = async (params: AccountInsertParams) => {
  let query = "INSERT INTO account (github_id, solana_pubkey, verified, is_admin)";
  query += ` VALUES ('${params.githubId}','${params.solanaKey.toString()}',${!!params.verified}, ${!!params.isAdmin})`;
  const result = await DB.query(query);
  return result;
};

export const getAccount = async (params: AccountGetParams) => {
  let query = `SELECT * FROM account where github_id='${params.githubId}'`;
  const result = await DB.query(query);
  return result;
};

// RAFFLE

export const insertIssue = async (params: RaffleParams) => {
  let query =
    "INSERT INTO issue (pubkey, raffle_type, raffle_mint,max_tickets, expiration,hidden)";
  query += ` VALUES ('${params.raffleKey.toString()}', '${
    params.raffleType
  }', '${params.raffleMint?.toString()}', ${
    params.maxTickets
  }, '${params?.expiration?.format(TIMESTAMP_FORMAT)}', ${params.hidden});`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

// RAFFLE ENTRY

export const insertRaffleEntry = async (params: RaffleEntryParams) => {
  let query = "INSERT INTO raffle_entry (users_key, raffle_key, count)";
  query += ` VALUES ('${params.userKey.toString()}', '${params.raffleKey.toString()}', ${
    params.count
  });`;
  const result = await DB.query(query);
  return result;
};

export const updateRaffleEntry = async (params: RaffleEntryParams) => {
  let query = `UPDATE raffle_entry set count=${params.count}`;
  query += ` WHERE users_key='${params.userKey.toString()}'`;
  query += ` AND raffle_key='${params.raffleKey.toString()}';`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const getRaffleEntry = async (params: GetRaffleEntryParams) => {
  let query = "SELECT count FROM raffle_entry";
  query += ` WHERE users_key = '${params.userKey.toString()}'`;
  query += ` AND raffle_key = '${params.raffleKey.toString()}';`;
  const result = await DB.query(query);
  return result.rows;
};

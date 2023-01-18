import { DB } from "../db";
import {
  RaffleEntryParams,
  UserParams,
  RaffleParams,
  GetRaffleEntryParams,
} from "../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { TIMESTAMP_FORMAT } from "../constants";
dayjs.extend(timezone);

// USERS

export const insertUser = async (params: UserParams) => {
  let query = "INSERT INTO users (pubkey, can_create_raffle, is_admin)";
  query += ` VALUES ('${params.userKey.toString()}',${!!params.canCreateRaffle}, ${!!params.isAdmin})`;
  const result = await DB.query(query);
  return result;
};

export const getUser = async (params: UserParams) => {
  let query = `SELECT * FROM users where pubkey='${params.userKey.toString()}'`;
  const result = await DB.query(query);
  return result;
};

// RAFFLE

export const insertRaffle = async (params: RaffleParams) => {
  let query =
    "INSERT INTO raffle (pubkey, raffle_type, raffle_mint,max_tickets, expiration,hidden)";
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

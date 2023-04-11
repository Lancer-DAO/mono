import { DB } from "@/db";
import {
  AccountInsertParams,
  AccountGetParams,
} from "@/types";
// USERS

export const insertAccount = async (params: AccountInsertParams) => {
  let query = `INSERT INTO account (github_login, github_id, solana_pubkey)`;
  query += ` VALUES ('${params.githubLogin}', '${params.githubId}', '${params.solanaKey}')`;
  console.log(query);
  const result = await DB.raw(query);
  return result[0];
};

export const insertAccountByEmail = async (email: string) => {
  let query = `INSERT INTO account (email)`;
  query += ` VALUES ('${email}')`;
  console.log(query);
  const result = await DB.raw(query);
  return result[0];
};


export const getAccount = async (params: AccountGetParams) => {
  let query = `SELECT * FROM account where github_id='${params.githubId}' or github_login='${params.githubLogin}'`;
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getAccountById = async (uuid: string) => {
  let query = `SELECT * FROM account where uuid='${uuid}'`;
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getAccountByEmail = async (email: string) => {
  let query = `SELECT * FROM account where email='${email}'`;
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const updateAccountByEmail = async (email: string, publicKey: string, githubId: string) => {
  let query = `UPDATE account set solana_pubkey='${publicKey}', github_id='${githubId}' where email='${email}'`;
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};
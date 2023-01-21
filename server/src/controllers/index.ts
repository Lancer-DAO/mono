import { DB } from "../db";
import {
  RaffleEntryParams,
  AccountInsertParams,
  AccountGetParams,
  RaffleParams,
  GetRaffleEntryParams,
  IssueGetParams,
  IssueInsertParams,
  IssueUpdateParams,
  PullRequestInsertParams,
  PullRequestGetParams,
  AccountIssueGetParams,
  AccountPullRequestGetParams,
  AccountIssueNewParams,
  AccountPullRequestNewParams,
  LinkPullRequestParams
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
  return result.rows.length > 0 ? result.rows[0] : undefined;
};

// RAFFLE

export const insertIssue = async (params: IssueInsertParams) => {
  let query =
    "INSERT INTO issue (funding_hash, title, repo, org, state, funding_amount)";
  query += ` VALUES ('${params.fundingHash}', '${
    params.title
  }', '${params.repo}', '${
    params.org
  }', 'new', ${
    params.fundingAmount
  });`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const getIssueByTitle = async (params: IssueGetParams) => {
  let query =
    "SELECT * from issue WHERE ";
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND title='${params.title}'`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : undefined;
};

export const getIssueByNumber = async (params: IssueGetParams) => {
  let query =
    "SELECT * from issue WHERE ";
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND issue_number=${params.issueNumber}`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : undefined;
};

export const updateIssueNumber = async (params: IssueGetParams) => {
  let query =
    `UPDATE issue SET issue_number=${params.issueNumber} where `;
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND title='${params.title}'`
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const updateIssueState = async (params: IssueUpdateParams) => {
  let query =
    `UPDATE issue SET state='${params.state}' where `;
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND title='${params.title}'`
  console.log(query);
  const result = await DB.query(query);
  return result;
};

// PULL REQUEST

export const insertPullRequest = async (params: PullRequestInsertParams) => {
  let query =
    "INSERT INTO pull_request (title, repo, org, pull_number)";
  query += ` VALUES ('${
    params.title
  }', '${params.repo}', '${
    params.org
  }', ${
    params.pullNumber
  });`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const getPullRequestByNumber = async (params: PullRequestGetParams) => {
  let query =
    "SELECT * from pull_request WHERE ";
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND pull_number=${params.pullNumber}`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : undefined;
};

export const insertAccountIssue = async (params: AccountIssueGetParams) => {
  const issue = await getIssueByTitle(params);
  const account = await getAccount(params)

  let query =
    "INSERT INTO account_issue (account_uuid, issue_uuid)";
  query += ` VALUES ('${
    account.uuid
  }', '${issue.uuid}');`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const getAccountIssue = async (params: AccountIssueGetParams) => {
  const issue = await getIssueByTitle(params);
  const account = await getAccount(params)

  let query =
    "SELECT * from account_issue WHERE ";
  query += `account_uuid='${account.uuid}'`
  query += ` AND issue_uuid='${issue.uuid}';`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : undefined;
};

export const insertAccountPullRequest = async (params: AccountPullRequestGetParams) => {
  const pullRequest = await getPullRequestByNumber(params);
  const account = await getAccount(params)

  let query =
    "INSERT INTO account_pull_request (account_uuid, pull_request_uuid, amount)";
  query += ` VALUES ('${
    account.uuid
  }', '${pullRequest.uuid}', ${params.amount});`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const getAccountPullRequest = async (params: AccountPullRequestGetParams) => {
  const pullRequest = await getPullRequestByNumber(params);
  const account = await getAccount(params)

  let query =
    "SELECT * from account_pull_request WHERE ";
  query += `account_uuid='${account.uuid}'`
  query += ` AND pull_request_uuid='${pullRequest.uuid}';`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : undefined;
};

export const newAccountIssue = async (params: AccountIssueNewParams) => {
  let issue = await getIssueByTitle(params);
  if (!issue) {
    console.log((await insertIssue(params)).rows)
    issue = await getIssueByTitle(params);
  }
  let account = await getAccount(params);
  if(!account) {
    console.log((await insertAccount(params)).rows)
    account = await getAccount(params);
  }

  let query =
    "INSERT INTO account_issue (account_uuid, issue_uuid)";
  query += ` VALUES ('${
    account.uuid
  }', '${issue.uuid}');`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const newAccountPullRequest = async (params: AccountPullRequestNewParams) => {
  let pullRequest = await getPullRequestByNumber(params);
  if (!pullRequest) {
    console.log((await insertPullRequest(params)).rows)
    pullRequest = await getPullRequestByNumber(params);
  }
  let account = await getAccount(params);
  if(!account) {
    console.log((await insertAccount(params)).rows)
    account = await getAccount(params);
  }

  let query =
    "INSERT INTO account_pull_request (account_uuid, pull_request_uuid, amount)";
  query += ` VALUES ('${
    account.uuid
  }', '${pullRequest.uuid}', ${params.amount});`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};

export const linkPullRequest = async (params: LinkPullRequestParams) => {
  let pullRequest = await getPullRequestByNumber(params);
  let issue = await getIssueByTitle(params);

  if(!issue || !pullRequest) {
    return 'Not Found'
  }

  let query =
    "UPDATE pull_request set issue_uuid=";
  query += `'${
    issue.uuid
  }' where uuid='${pullRequest.uuid}'`;
  console.log(query);
  const result = await DB.query(query);
  return result;
};
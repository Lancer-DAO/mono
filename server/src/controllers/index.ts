import { DB } from "../db";
import {
  AccountInsertParams,
  AccountGetParams,
  IssueGetParams,
  IssueInsertParams,
  IssueUpdateParams,
  PullRequestInsertParams,
  PullRequestGetParams,
  AccountIssueGetParams,
  AccountPullRequestGetParams,
  AccountIssueNewParams,
  LinkPullRequestParams,
  NewPullRequestParams,
  GetFullPullRequest,
  PullRequestUpdateParams,
  AccountPullRequestNewParams
} from "../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { TIMESTAMP_FORMAT } from "../constants";
dayjs.extend(timezone);

// USERS

export const insertAccount = async (params: AccountInsertParams) => {
  let query = `INSERT INTO account (github_login,${params.githubId &&  'github_id, '}${ params.solanaKey && 'solana_pubkey,'} verified, is_admin)`;
  query += ` VALUES ('${params.githubLogin}',${params.githubId && ` '${params.githubId}',`}${params.solanaKey && ` '${params.solanaKey.toString()}',`} ${!!params.verified}, ${!!params.isAdmin})`;
  const result = await DB.query(query);
  return result;
};

export const getAccount = async (params: AccountGetParams) => {
  let query = `SELECT * FROM account where github_login='${params.githubLogin}'`;
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
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
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getIssueByNumber = async (params: IssueGetParams) => {
  let query =
    "SELECT * from issue WHERE ";
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND issue_number=${params.issueNumber}`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
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
  query += ` AND issue_number='${params.issueNumber}'`
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
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const updatePullRequestPayout = async (params: PullRequestUpdateParams) => {
  let query =
    `UPDATE pull_request set payout_hash='${params.payoutHash}' WHERE `

    query += `repo='${params.repo}'`
    query += ` AND org='${params.org}'`
    query += ` AND pull_number=${params.pullNumber}`
  console.log(query);
  const result = await DB.query(query);
  return result;
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
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const insertAccountPullRequest = async (params: AccountPullRequestNewParams) => {
  const pullRequest = await getPullRequestByNumber(params);
  const account = await getAccount(params)

  let query =
    "INSERT INTO account_pull_request (account_uuid, pull_request_uuid)";
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
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const newAccountIssue = async (params: AccountIssueNewParams) => {
  let issue = await getIssueByTitle(params);
  if (issue.message === 'NOT FOUND') {
    console.log((await insertIssue(params)).rows)
    issue = await getIssueByTitle(params);
  }
  let account = await getAccount(params);
  if(account.message === 'NOT FOUND') {
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

export const newPullRequest = async (params: NewPullRequestParams) => {
  let pullRequest = await getPullRequestByNumber(params);
  console.log(pullRequest)
  if (pullRequest.message === 'NOT FOUND') {
    console.log((await insertPullRequest(params)).rows)
    pullRequest = await getPullRequestByNumber(params);
  }
  let account = await getAccount(params);
  console.log('account',account)
  if(account.message === 'NOT FOUND') {
    console.log((await insertAccount(params)).rows)
    account = await getAccount(params);
  }
  let issue = await getIssueByNumber(params)
  let linkedPr = await getAccountPullRequest(params);
  if(linkedPr.message === 'NOT FOUND') {

    let query =
    "INSERT INTO account_pull_request (account_uuid, pull_request_uuid, amount)";
  query += ` VALUES ('${
    account.uuid
  }', '${pullRequest.uuid}', ${issue.funding_amount});`;
  await DB.query(query);

  }
  if(issue.state !== 'in_progress') {

    let query = `UPDATE issue set state='in_progress' where uuid='${issue.uuid}';`
    console.log(query);
  await DB.query(query);

  }


  linkPullRequest(params)
  return {message: 'SUCCESS'};
};

export const linkPullRequest = async (params: LinkPullRequestParams) => {
  let pullRequest = await getPullRequestByNumber(params);
  let issue = await getIssueByNumber(params);

  if(!issue || !pullRequest) {
    return {message: 'NOT FOUND'}
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

export const getFullPullRequestByNumber = async (params: GetFullPullRequest) => {
  let query =
    "SELECT pr.payout_hash, pr.org, pr.repo, i.state, i.funding_amount, a.solana_pubkey, i.issue_number, pr.pull_number, i.funding_hash, a.github_login, a.github_id "

  query += ` from pull_request as pr`
  query += ` LEFT OUTER JOIN account_pull_request as apr`
  query += ` ON pr.uuid = apr.pull_request_uuid`
  query += ` LEFT OUTER JOIN account as a`
  query += ` ON apr.account_uuid = a.uuid`
  query += ` INNER JOIN issue as i`
  query += ` ON i.uuid = pr.issue_uuid`
  query += ` WHERE pr.repo='${params.repo}'`
  query += ` AND pr.org='${params.org}'`
  query += ` AND pr.pull_number=${params.pullNumber}`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getAllIssues = async () => {
  let query =
    "SELECT i.title, i.funding_amount, i.issue_number, i.funding_hash, i.org, i.repo, i.state, a.github_login, a.github_id "

  query += ` from issue as i`
  query += ` LEFT OUTER JOIN account_issue as ai`
  query += ` ON i.uuid = ai.issue_uuid`
  query += ` LEFT OUTER JOIN account as a`
  query += ` ON ai.account_uuid = a.uuid`
  console.log(query);
  const result = await DB.query(query);
  return result.rows.length > 0 ? result.rows : {message: 'NOT FOUND'};
};
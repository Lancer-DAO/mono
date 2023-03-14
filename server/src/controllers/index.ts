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
  AccountPullRequestNewParams,
  AccountIssueUpdateParams
} from "../types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { TIMESTAMP_FORMAT } from "../constants";
dayjs.extend(timezone);

// USERS

export const insertAccount = async (params: AccountInsertParams) => {
  let query = `INSERT INTO account (github_login, github_id, solana_pubkey)`;
  query += ` VALUES ('${params.githubLogin}', '${params.githubId}', '${params.solanaKey}')`;
  const result = await DB.raw(query);
  console.log(result[0])
  return result[0];
};


export const getAccount = async (params: AccountGetParams) => {
  let query = `SELECT * FROM account where github_id='${params.githubId}' or github_login='${params.githubLogin}'`;
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getAccountById = async (uuid: string) => {
  let query = `SELECT * FROM account where uuid='${uuid}'`;
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

// ISSUE

export const insertIssue = async (params: IssueInsertParams) => {
  let query =
    "INSERT INTO issue (issue_number, title, repo, org, state, estimated_time, private, tags, description)";
  query += ` VALUES (${params.issueNumber}, '${
    params.title
  }', '${params.repo}', '${
    params.org
  }', 'new', ${
    params.estimatedTime
  }, ${
    params.private
  }, ${
    `'{${params.tags.map((tag) => `"${tag}"`).join(", ")}}'`
  }, '${
    params.description.replace("'", "\'")
  }');`;
  console.log(query);
  const result = await DB.raw(query);
  return result;
};

export const getIssueByTitle = async (params: IssueGetParams) => {
  let query =
    "SELECT * from issue WHERE ";
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND title='${params.title}'`
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getIssueByNumber = async (params: IssueGetParams) => {
  let query =
    "SELECT * from issue WHERE ";
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND issue_number=${params.issueNumber}`
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getIssueById = async (uuid: string) => {
  let query =
    "SELECT * from issue WHERE ";
  query += `uuid='${uuid}';`
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const updateIssueNumber = async (params: IssueGetParams) => {
  let query =
    `UPDATE issue SET issue_number=${params.issueNumber} where `;
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND title='${params.title}'`
  console.log(query);
  const result = await DB.raw(query);
  return result;
};

export const updateIssueState = async (params: IssueUpdateParams) => {
  let query =
    `UPDATE issue SET state='${params.state}' where `;
  query += `uuid='${params.uuid}';`
  console.log(query);
  const result = await DB.raw(query);
  return result;
};

export const updateIssueHash = async (params: IssueUpdateParams) => {
  let query =
    `UPDATE issue SET funding_hash='${params.hash}', funding_amount='${params.amount}', funding_mint='${params.mint}', state='accepting_applications' where `;
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND issue_number='${params.issueNumber}'`
  console.log(query);
  const result = await DB.raw(query);
  return result;
};

export const updateIssueEscrowKey = async (params: IssueUpdateParams) => {
  let query =
    `UPDATE issue SET escrow_key='${params.escrowKey}' where `;
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND issue_number='${params.issueNumber}'`
  console.log(query);
  const result = await DB.raw(query);
  return result;
};

export const updateIssueTimestamp = async (params: IssueUpdateParams) => {
  let query =
    `UPDATE issue SET unix_timestamp='${params.timestamp}' where `;
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND issue_number='${params.issueNumber}'`
  console.log(query);
  const result = await DB.raw(query);
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
  const result = await DB.raw(query);
  return result;
};

export const getPullRequestByNumber = async (params: PullRequestGetParams) => {
  let query =
    "SELECT * from pull_request WHERE ";
  query += `repo='${params.repo}'`
  query += ` AND org='${params.org}'`
  query += ` AND pull_number=${params.pullNumber}`
  console.log(query);
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const updatePullRequestPayout = async (params: PullRequestUpdateParams) => {
  let query =
    `UPDATE pull_request set payout_hash='${params.payoutHash}' WHERE `

    query += `repo='${params.repo}'`
    query += ` AND org='${params.org}'`
    query += ` AND pull_number=${params.pullNumber}`
  console.log(query);
  const result = await DB.raw(query);
  return result;
};

export const insertAccountIssue = async (params: {accountId: string, issueId: string}) => {
  const issue = await getIssueById(params.issueId);
  const account = await getAccountById(params.accountId)

  let query =
    "INSERT INTO account_issue (account_uuid, issue_uuid, relations)";
  query += ` VALUES ('${
    account.uuid
  }', '${issue.uuid}', '{"requested_submitter"}');`;
  console.log(query);
  const result = await DB.raw(query);
  return result;
};

export const updateAccountIssue = async (params: AccountIssueUpdateParams & {accountId: string, issueId: string}) => {
  const issue = await getIssueById(params.issueId);
  const account = await getAccountById(params.accountId)

  let query =
  `UPDATE account_issue set relations='{${params.relations.map((relation) => `"${relation}"`).join(", ")}}'`;

  query += ` WHERE account_uuid='${
    account.uuid
  }' and  issue_uuid='${issue.uuid}';`;
  console.log(query);
  const result = await DB.raw(query);
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
  const result = await DB.raw(query);
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
  const result = await DB.raw(query);
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
  const result = await DB.raw(query);
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
  console.log('issue', issue)

  let query =
    "INSERT INTO account_issue (account_uuid, issue_uuid, relations)";
  query += ` VALUES ('${
    account.uuid
  }', '${issue.uuid}', '{"creator"}');`;
  console.log(query);
  await DB.raw(query);
  const result = {
    message: "Issue Created",
    issue: {
      number: issue.issue_number,
      uuid: issue.uuid
    }
  }
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
    "INSERT INTO account_pull_request (account_uuid, pull_request_uuid)";
  query += ` VALUES ('${
    account.uuid
  }', '${pullRequest.uuid}');`;
  await DB.raw(query);

  }
  if(issue.state !== 'in_progress') {

    let query = `UPDATE issue set state='in_progress' where uuid='${issue.uuid}';`
    console.log(query);
  await DB.raw(query);

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
  const result = await DB.raw(query);
  return result;
};

export const getFullPullRequestByNumber = async (params: GetFullPullRequest) => {
  let query =
    "SELECT i.uuid, pr.payout_hash, pr.org, pr.repo, i.state, i.funding_amount, a.solana_pubkey, i.issue_number, pr.pull_number, i.funding_hash, a.github_login, a.github_id "

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
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getAllIssues = async () => {
  let query =
    "SELECT pr.pull_number, i.private, i.unix_timestamp, i.description, i.escrow_key, i.uuid, i.tags, i.estimated_time, i.title, i.funding_amount, i.funding_mint, i.issue_number, i.funding_hash, i.org, i.repo, i.state "

  query += ` from issue as i`
  query += ` LEFT OUTER JOIN pull_request as pr`
  query += ` ON pr.issue_uuid = i.uuid`
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows : {message: 'NOT FOUND'};
};

export const getAllIssuesForUser = async (uuid: string) => {
  let query =
    "SELECT pr.pull_number, i.private, i.unix_timestamp, i.description, i.escrow_key, i.uuid, i.tags, i.estimated_time, i.title, i.funding_amount, i.funding_mint, i.issue_number, i.funding_hash, i.org, i.repo, i.state, ai.relations "

  query += ` from issue as i`
  query += ` LEFT OUTER JOIN pull_request as pr`
  query += ` ON pr.issue_uuid = i.uuid`
  query += ` LEFT OUTER JOIN account_issue as ai`
  query += ` ON ai.issue_uuid = i.uuid`
  query += ` WHERE ai.account_uuid = '${uuid}'`
  console.log(query)
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows : {message: 'NOT FOUND'};
};

export const getAllIssuesForRepo = async (org:string, repo:string) => {
  let query =
    "SELECT issue_number"

  query += ` from issue as i`
  query += ` WHERE org='${org}' and repo ='${repo}'`
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows : {message: 'NOT FOUND'};
};

export const getIssueByUuid = async (uuid: string) => {
  let query =
    "SELECT pr.pull_number, i.unix_timestamp, i.description, i.escrow_key, i.uuid, i.tags, i.estimated_time, i.title, i.funding_amount, i.funding_mint, i.issue_number, i.funding_hash, i.org, i.repo, i.state "

  query += ` from issue as i`
  query += ` LEFT OUTER JOIN pull_request as pr`
  query += ` ON pr.issue_uuid = i.uuid`
  query += ` WHERE i.uuid = '${uuid}'`
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows[0] : {message: 'NOT FOUND'};
};

export const getAccountsForIssue = async (uuid: string) => {
  let query =
    "SELECT a.github_login, a.github_id, a.solana_pubkey, ai.account_uuid, ai.relations "

  query += ` from issue as i`
  query += ` LEFT OUTER JOIN account_issue as ai`
  query += ` ON i.uuid = ai.issue_uuid`
  query += ` LEFT OUTER JOIN account as a`
  query += ` ON ai.account_uuid = a.uuid`
  query += ` WHERE i.uuid = '${uuid}'`
  const result = await DB.raw(query);
  return result.rows.length > 0 ? result.rows : {message: 'NOT FOUND'};
}
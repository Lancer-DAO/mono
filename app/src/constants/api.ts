export const API_ENDPOINT = 'https://api.lancer.so/'
export const API_ENDPOINT_DEV = 'http://localhost:3001/'
export const IS_LOCAL_API = false;

// DATA
export const DATA_API_ROUTE = "api/data"

// USER
export const ACCOUNT_API_ROUTE = `${DATA_API_ROUTE}/account`
export const CREATE_USER_ROUTE = `${ACCOUNT_API_ROUTE}/create`
export const USER_REPOSITORIES_ROUTE = `${ACCOUNT_API_ROUTE}/repository`
export const USER_REPOSITORY_ISSUES_ROUTE = `${ACCOUNT_API_ROUTE}/repository/issue`
export const USER_REPOSITORY_NO_BOUNTIES_ROUTE = `${USER_REPOSITORY_ISSUES_ROUTE}/open_no_bounties`
export const USER_ISSUE_RELATION_ROUTE = `${DATA_API_ROUTE}/account_issue_relation`


// ISSUE
export const ISSUE_API_ROUTE = `${DATA_API_ROUTE}/issue`;
export const ISSUES_API_ROUTE = `${DATA_API_ROUTE}/issues`;
export const NEW_GITHUB_ISSUE_API_ROUTE = `${ISSUE_API_ROUTE}/new`
export const LINK_GITHUB_ISSUE_API_ROUTE = `${ISSUE_API_ROUTE}/link`
export const UPDATE_ISSUE_ROUTE = `${ISSUE_API_ROUTE}/update`
export const ISSUE_ACCOUNT_ROUTE = `${ISSUE_API_ROUTE}/accounts`

// PULL REQUEST
export const MERGE_PULL_REQUEST_API_ROUTE = `${DATA_API_ROUTE}/pull_request/merge`
export const NEW_PULL_REQUEST_API_ROUTE = `${DATA_API_ROUTE}/pull_request/create`
export const FULL_PULL_REQUEST_API_ROUTE = `${DATA_API_ROUTE}/pull_request`
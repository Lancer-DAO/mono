import { DB } from ".";

const temp = {"access_token":"eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaXNzIjoiaHR0cHM6Ly9kZXYta2d2bTFzeGUudXMuYXV0aDAuY29tLyJ9..0KmJxAzIdA83lo3R.3usWjgYjGkdbXRtjB9ywJunv7ea-8oNYxYljZM_MFU8Gz8ZlUXxkLWWKGw5BSRNCwOjjOuaAm-dYg0VKyDnB2Qvm59Z7J7MeNuKBL_xdw3Fn78fgJRpwgtBY_3SViEXjxaDeCg6aN8AZSbbFqLnCJn3ERgZQsl5_77aWPtYhXGlRy-AE4z9XfE9Ei5RI0SkkoNCgVzRCMTT2fVi6ckbV8LOAJP8kxdlgMDQOsRRLwYhxxAmHw7p1CpZO0sMAyzUsXs0YyN_QmPnwKcHidDPOTTWaZvizqQ.ciJy9M9F2HKr_9qmxUd60g",
"id_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRDcmFKRjR4alU1Ml9yOEJCZ3hXdSJ9.eyJpc3MiOiJodHRwczovL2Rldi1rZ3ZtMXN4ZS51cy5hdXRoMC5jb20vIiwic3ViIjoiZ2l0aHVifDExNzQ5Mjc5NCIsImF1ZCI6IlphVTFvWnp2bGIwNnRaQzhVWHRUdlRNOUtTQlk5cHprIiwiaWF0IjoxNjc0MDA3OTYxLCJleHAiOjE2NzQwNDM5NjEsInNpZCI6IjE0VEFtb3dvZjJ6eFZPdkJId2ZvelYtam8tUzZFSkg1In0.f95VKiMUD-AZSi9pkQJH8rXQRYB6pI_LXQB8bxCT8rhPCx9_t2HnFCue7kvVzfPzyjeC4HwP0rXNnIKIhaOYqfAG6MUuMc-86phXWlTMCA6ubvSSM85516O332fiMLRWtC21p3Zm23jR-QEJ_ADvoZ9pXjxMNf90DOALpQLnjKhq6R7FWk1NqT-4H2kKKTBIfAu9xqQFklIRlUwOWF3pamgQNqIbqVCtZjg9uUDkvbTt9jKn0N7NwmEPwFlRaUWFhylY3z4H2UWOUGjtmxPRA7X3XwyagleSp1GrhRSf3o3fP-Xyjsrwao18QUeWpF3KTppOvB-Na3eTNFeCJzgx8w",
"scope":"openid","expires_in":86400,"token_type":"Bearer"}
const uuid_ext = "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";";

const account = `CREATE TABLE account (
    uuid UUID DEFAULT uuid_generate_v4 (),
    solana_pubkey VARCHAR,
    is_admin BOOLEAN NOT NULL,
    verified BOOLEAN NOT NULL,
    github_id VARCHAR NOT NULL,
		name VARCHAR,
		discord VARCHAR,
		twitter VARCHAR,
		instagram VARCHAR,
    PRIMARY KEY (uuid)
);`;

const issue = `CREATE TABLE issue (
    uuid UUID DEFAULT uuid_generate_v4 (),
		fundingHash VARCHAR,
    fundingAmount DECIMAL(20),
    title VARCHAR,
    repo VARCHAR,
    org VARCHAR,
    issueNumber DECIMAL(20),
    state VARCHAR,
    type VARCHAR,
    PRIMARY KEY (uuid)
);`;

const pullRequest = `CREATE TABLE pull_request (
  uuid UUID DEFAULT uuid_generate_v4 (),
  title VARCHAR,
  repo VARCHAR,
  org VARCHAR,
  pullNumber DECIMAL(20),
  PRIMARY KEY (uuid)
);`;

const accountIssueAssoc = `CREATE TABLE account_issue (
  account_uuid UUID,
  issue_uuid UUID,
  PRIMARY KEY (account_uuid, issue_uuid),
  CONSTRAINT fk_account FOREIGN KEY(account_uuid) REFERENCES account(uuid),
  CONSTRAINT fk_issue FOREIGN KEY(issue_uuid) REFERENCES issue(uuid)
);`;

const accountPullRequestAssoc = `CREATE TABLE account_pull_request (
  account_uuid UUID,
  pull_request_uuid UUID,
  PRIMARY KEY (account_uuid, pull_request_uuid),
  CONSTRAINT fk_account FOREIGN KEY(account_uuid) REFERENCES account(uuid),
  CONSTRAINT fk_pull_request FOREIGN KEY(pull_request_uuid) REFERENCES pull_request(uuid),
  amount DECIMAL(20)
);`;

export async function migrate() {
  await DB.query("begin", []);
  await DB.query(uuid_ext, []);
  await DB.query(account, []);
  await DB.query(issue, []);
  await DB.query(pullRequest, []);
  await DB.query(accountIssueAssoc, []);
  await DB.query(accountPullRequestAssoc, []);
  await DB.query("commit", []);
}

migrate();

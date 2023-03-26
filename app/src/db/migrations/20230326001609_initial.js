/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(`
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE TABLE account (
    uuid UUID DEFAULT uuid_generate_v4 (),
    solana_pubkey VARCHAR,
    is_admin BOOLEAN,
    verified BOOLEAN,
    github_id VARCHAR NOT NULL,
    github_login VARCHAR NOT NULL,
		name VARCHAR,
		discord VARCHAR,
		twitter VARCHAR,
		instagram VARCHAR,
    PRIMARY KEY (uuid)
);

CREATE TABLE issue (
    uuid UUID DEFAULT uuid_generate_v4 (),
		funding_hash VARCHAR,
    funding_amount DECIMAL(20,10),
    funding_mint VARCHAR,
    escrow_key VARCHAR,
    title VARCHAR,
    repo VARCHAR,
    org VARCHAR,
    issue_number DECIMAL(20),
    state VARCHAR,
    type VARCHAR,
    estimated_time DECIMAL(10, 2),
    private BOOLEAN,
    tags VARCHAR[],
    description text,
    unix_timestamp VARCHAR,
    PRIMARY KEY (uuid)
);

CREATE TABLE pull_request (
    uuid UUID DEFAULT uuid_generate_v4 (),
    title VARCHAR,
    repo VARCHAR,
    org VARCHAR,
    pull_number DECIMAL(20),
    issue_uuid UUID,
    payout_hash VARCHAR,
    CONSTRAINT fk_issue_pr FOREIGN KEY(issue_uuid) REFERENCES issue(uuid),
    PRIMARY KEY (uuid)
  );

  CREATE TABLE account_issue (
    account_uuid UUID,
    issue_uuid UUID,
    PRIMARY KEY (account_uuid, issue_uuid),
    relations VARCHAR[],
    CONSTRAINT fk_account FOREIGN KEY(account_uuid) REFERENCES account(uuid),
    CONSTRAINT fk_issue FOREIGN KEY(issue_uuid) REFERENCES issue(uuid)
  );

  CREATE TABLE account_pull_request (
    account_uuid UUID,
    pull_request_uuid UUID,
    PRIMARY KEY (account_uuid, pull_request_uuid),
    CONSTRAINT fk_account FOREIGN KEY(account_uuid) REFERENCES account(uuid),
    CONSTRAINT fk_pull_request FOREIGN KEY(pull_request_uuid) REFERENCES pull_request(uuid),
    amount DECIMAL(10,10)
  );

  `)

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

};

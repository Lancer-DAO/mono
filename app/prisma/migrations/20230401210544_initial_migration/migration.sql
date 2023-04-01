-- CreateTable
CREATE TABLE "account" (
    "uuid" UUID NOT NULL,
    "solana_pubkey" VARCHAR,
    "is_admin" BOOLEAN,
    "verified" BOOLEAN,
    "github_id" VARCHAR,
    "github_login" VARCHAR,
    "name" VARCHAR,
    "discord" VARCHAR,
    "twitter" VARCHAR,
    "instagram" VARCHAR,
    "email" VARCHAR,

    CONSTRAINT "account_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "account_issue" (
    "account_uuid" UUID NOT NULL,
    "issue_uuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "account_issue_pkey" PRIMARY KEY ("account_uuid","issue_uuid")
);

-- CreateTable
CREATE TABLE "account_pull_request" (
    "account_uuid" UUID NOT NULL,
    "pull_request_uuid" UUID NOT NULL,
    "amount" DECIMAL(10,10),

    CONSTRAINT "account_pull_request_pkey" PRIMARY KEY ("account_uuid","pull_request_uuid")
);

-- CreateTable
CREATE TABLE "issue" (
    "uuid" UUID NOT NULL,
    "funding_hash" VARCHAR,
    "funding_amount" DECIMAL(20,10),
    "funding_mint" VARCHAR,
    "escrow_key" VARCHAR,
    "title" VARCHAR,
    "repo" VARCHAR,
    "org" VARCHAR,
    "issue_number" DECIMAL(20,0),
    "state" VARCHAR,
    "type" VARCHAR,
    "estimated_time" DECIMAL(10,2),
    "private" BOOLEAN,
    "tags" VARCHAR[],
    "description" TEXT,
    "unix_timestamp" VARCHAR,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "pull_request" (
    "uuid" UUID NOT NULL,
    "title" VARCHAR,
    "repo" VARCHAR,
    "org" VARCHAR,
    "pull_number" DECIMAL(20,0),
    "issue_uuid" UUID,
    "payout_hash" VARCHAR,

    CONSTRAINT "pull_request_pkey" PRIMARY KEY ("uuid")
);

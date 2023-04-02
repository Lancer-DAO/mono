-- CreateTable
CREATE TABLE "Bounty" (
    "uuid" UUID NOT NULL,
    "created" VARCHAR,
    "description" VARCHAR,
    "estimatedTime" DECIMAL(10,2),
    "isPrivate" BOOLEAN,
    "state" VARCHAR,
    "title" VARCHAR,
    "type" VARCHAR,
    "escrowUuid" UUID NOT NULL,
    "milestoneUuid" UUID,
    "projectUuid" UUID,
    "protocolUuid" UUID,
    "repositoryUuid" UUID,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Chain" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "network" VARCHAR NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Comment" (
    "uuid" UUID NOT NULL,
    "content" VARCHAR,
    "createdAt" VARCHAR,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Escrow" (
    "uuid" UUID NOT NULL,
    "amount" DECIMAL(20,10),
    "mint" VARCHAR,
    "publicKey" VARCHAR,
    "timestamp" VARCHAR,
    "chainUuid" UUID,
    "milestoneUuid" UUID,

    CONSTRAINT "Escrow_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Issue" (
    "uuid" UUID NOT NULL,
    "title" VARCHAR,
    "number" DECIMAL(10,0),
    "description" VARCHAR NOT NULL,
    "state" VARCHAR NOT NULL,
    "githubLink" VARCHAR NOT NULL,
    "bountyUuid" UUID NOT NULL,
    "repositoryUuid" UUID NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR,
    "dueDate" VARCHAR,
    "description" VARCHAR,
    "escrowUuid" UUID,
    "projectUuid" UUID NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Project" (
    "uuid" UUID NOT NULL,
    "description" VARCHAR,
    "escrowUuid" UUID,
    "protocolUuid" UUID NOT NULL,
    "repositoryUuid" UUID NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Protocol" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR,
    "logo" VARCHAR,
    "website" VARCHAR,

    CONSTRAINT "Protocol_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "uuid" UUID NOT NULL,
    "title" VARCHAR,
    "repo" VARCHAR,
    "org" VARCHAR,
    "pull_number" DECIMAL(20,0),
    "issue_uuid" UUID,
    "payout_hash" VARCHAR,
    "bountyUuid" UUID NOT NULL,
    "repositoryUuid" UUID NOT NULL,
    "issueUuid" UUID NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Repository" (
    "uuid" UUID NOT NULL,
    "link" VARCHAR,
    "name" VARCHAR,
    "organizationName" VARCHAR,
    "protocolUuid" UUID,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Tag" (
    "uuid" UUID NOT NULL,
    "color" VARCHAR,
    "description" VARCHAR,
    "name" VARCHAR,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "uuid" UUID NOT NULL,
    "signature" VARCHAR,
    "timestamp" VARCHAR,
    "chainUuid" UUID NOT NULL,
    "escrowUuid" UUID NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "User" (
    "uuid" UUID NOT NULL,
    "isAdmin" BOOLEAN,
    "verified" BOOLEAN,
    "githubId" VARCHAR,
    "githubLogin" VARCHAR,
    "name" VARCHAR,
    "discord" VARCHAR,
    "twitter" VARCHAR,
    "instagram" VARCHAR,
    "email" VARCHAR,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "uuid" UUID NOT NULL,
    "pubkey" VARCHAR,
    "chain" VARCHAR,
    "provider" VARCHAR,
    "network" VARCHAR,
    "isDefault" BOOLEAN,
    "userUuid" UUID NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "BountyCertificate" (
    "certificateUuid" UUID NOT NULL,
    "bountyUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "BountyCertificate_pkey" PRIMARY KEY ("certificateUuid","bountyUuid")
);

-- CreateTable
CREATE TABLE "BountyComment" (
    "commentUuid" UUID NOT NULL,
    "bountyUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "BountyComment_pkey" PRIMARY KEY ("commentUuid","bountyUuid")
);

-- CreateTable
CREATE TABLE "BountyTag" (
    "tagUuid" UUID NOT NULL,
    "bountyUuid" UUID NOT NULL,

    CONSTRAINT "BountyTag_pkey" PRIMARY KEY ("tagUuid","bountyUuid")
);

-- CreateTable
CREATE TABLE "BountyUser" (
    "userUuid" UUID NOT NULL,
    "bountyUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "BountyUser_pkey" PRIMARY KEY ("userUuid","bountyUuid")
);

-- CreateTable
CREATE TABLE "CertificateProtocol" (
    "certificateUuid" UUID NOT NULL,
    "protocolUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "CertificateProtocol_pkey" PRIMARY KEY ("certificateUuid","protocolUuid")
);

-- CreateTable
CREATE TABLE "CertificateTag" (
    "tagUuid" UUID NOT NULL,
    "certificateUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "CertificateTag_pkey" PRIMARY KEY ("tagUuid","certificateUuid")
);

-- CreateTable
CREATE TABLE "CertificateUser" (
    "userUuid" UUID NOT NULL,
    "certificateUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "CertificateUser_pkey" PRIMARY KEY ("userUuid","certificateUuid")
);

-- CreateTable
CREATE TABLE "ChainEscrow" (
    "escrowUuid" UUID NOT NULL,
    "chainUuid" UUID NOT NULL,
    "relations" VARCHAR[],
    "certificateUuid" UUID,

    CONSTRAINT "ChainEscrow_pkey" PRIMARY KEY ("escrowUuid","chainUuid")
);

-- CreateTable
CREATE TABLE "ChainTransaction" (
    "transactionUuid" UUID NOT NULL,
    "chainUuid" UUID NOT NULL,
    "relations" VARCHAR[],
    "certificateUuid" UUID,

    CONSTRAINT "ChainTransaction_pkey" PRIMARY KEY ("transactionUuid","chainUuid")
);

-- CreateTable
CREATE TABLE "ChainWallet" (
    "walletUuid" UUID NOT NULL,
    "chainUuid" UUID NOT NULL,
    "relations" VARCHAR[],
    "certificateUuid" UUID,

    CONSTRAINT "ChainWallet_pkey" PRIMARY KEY ("walletUuid","chainUuid")
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "transactionUuid" UUID NOT NULL,
    "escrowUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("transactionUuid","escrowUuid")
);

-- CreateTable
CREATE TABLE "EscrowUser" (
    "userUuid" UUID NOT NULL,
    "escrowUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "EscrowUser_pkey" PRIMARY KEY ("userUuid","escrowUuid")
);

-- CreateTable
CREATE TABLE "MilestoneTag" (
    "tagUuid" UUID NOT NULL,
    "milestoneUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "MilestoneTag_pkey" PRIMARY KEY ("tagUuid","milestoneUuid")
);

-- CreateTable
CREATE TABLE "MilestoneUser" (
    "userUuid" UUID NOT NULL,
    "milestoneUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "MilestoneUser_pkey" PRIMARY KEY ("userUuid","milestoneUuid")
);

-- CreateTable
CREATE TABLE "ProjectUser" (
    "userUuid" UUID NOT NULL,
    "projectUuid" UUID NOT NULL,
    "relations" VARCHAR[],
    "protocolUuid" UUID,

    CONSTRAINT "ProjectUser_pkey" PRIMARY KEY ("userUuid","projectUuid")
);

-- CreateTable
CREATE TABLE "ProtocolUser" (
    "userUuid" UUID NOT NULL,
    "protocolUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "ProtocolUser_pkey" PRIMARY KEY ("userUuid","protocolUuid")
);

-- CreateTable
CREATE TABLE "TagUser" (
    "userUuid" UUID NOT NULL,
    "tagUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "TagUser_pkey" PRIMARY KEY ("userUuid","tagUuid")
);

-- CreateTable
CREATE TABLE "TransactionWallet" (
    "walletUuid" UUID NOT NULL,
    "transactionUuid" UUID NOT NULL,
    "relations" VARCHAR[],

    CONSTRAINT "TransactionWallet_pkey" PRIMARY KEY ("walletUuid","transactionUuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bounty_escrowUuid_key" ON "Bounty"("escrowUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Bounty_milestoneUuid_key" ON "Bounty"("milestoneUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Bounty_projectUuid_key" ON "Bounty"("projectUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Bounty_protocolUuid_key" ON "Bounty"("protocolUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Bounty_repositoryUuid_key" ON "Bounty"("repositoryUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Escrow_chainUuid_key" ON "Escrow"("chainUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_bountyUuid_key" ON "Issue"("bountyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_repositoryUuid_key" ON "Issue"("repositoryUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_escrowUuid_key" ON "Milestone"("escrowUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_projectUuid_key" ON "Milestone"("projectUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Project_escrowUuid_key" ON "Project"("escrowUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Project_protocolUuid_key" ON "Project"("protocolUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Project_repositoryUuid_key" ON "Project"("repositoryUuid");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_bountyUuid_key" ON "PullRequest"("bountyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_repositoryUuid_key" ON "PullRequest"("repositoryUuid");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_issueUuid_key" ON "PullRequest"("issueUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_protocolUuid_key" ON "Repository"("protocolUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_chainUuid_key" ON "Transaction"("chainUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_escrowUuid_key" ON "Transaction"("escrowUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userUuid_key" ON "Wallet"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyCertificate_certificateUuid_key" ON "BountyCertificate"("certificateUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyCertificate_bountyUuid_key" ON "BountyCertificate"("bountyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyComment_commentUuid_key" ON "BountyComment"("commentUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyComment_bountyUuid_key" ON "BountyComment"("bountyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyTag_tagUuid_key" ON "BountyTag"("tagUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyTag_bountyUuid_key" ON "BountyTag"("bountyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyUser_userUuid_key" ON "BountyUser"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "BountyUser_bountyUuid_key" ON "BountyUser"("bountyUuid");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateProtocol_certificateUuid_key" ON "CertificateProtocol"("certificateUuid");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateProtocol_protocolUuid_key" ON "CertificateProtocol"("protocolUuid");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateTag_tagUuid_key" ON "CertificateTag"("tagUuid");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateTag_certificateUuid_key" ON "CertificateTag"("certificateUuid");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateUser_userUuid_key" ON "CertificateUser"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateUser_certificateUuid_key" ON "CertificateUser"("certificateUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChainEscrow_escrowUuid_key" ON "ChainEscrow"("escrowUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChainEscrow_chainUuid_key" ON "ChainEscrow"("chainUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChainTransaction_transactionUuid_key" ON "ChainTransaction"("transactionUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChainTransaction_chainUuid_key" ON "ChainTransaction"("chainUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChainWallet_walletUuid_key" ON "ChainWallet"("walletUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ChainWallet_chainUuid_key" ON "ChainWallet"("chainUuid");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_transactionUuid_key" ON "EscrowTransaction"("transactionUuid");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_escrowUuid_key" ON "EscrowTransaction"("escrowUuid");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowUser_userUuid_key" ON "EscrowUser"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowUser_escrowUuid_key" ON "EscrowUser"("escrowUuid");

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneTag_tagUuid_key" ON "MilestoneTag"("tagUuid");

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneTag_milestoneUuid_key" ON "MilestoneTag"("milestoneUuid");

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneUser_userUuid_key" ON "MilestoneUser"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneUser_milestoneUuid_key" ON "MilestoneUser"("milestoneUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUser_userUuid_key" ON "ProjectUser"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUser_projectUuid_key" ON "ProjectUser"("projectUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolUser_userUuid_key" ON "ProtocolUser"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolUser_protocolUuid_key" ON "ProtocolUser"("protocolUuid");

-- CreateIndex
CREATE UNIQUE INDEX "TagUser_userUuid_key" ON "TagUser"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "TagUser_tagUuid_key" ON "TagUser"("tagUuid");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionWallet_walletUuid_key" ON "TransactionWallet"("walletUuid");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionWallet_transactionUuid_key" ON "TransactionWallet"("transactionUuid");

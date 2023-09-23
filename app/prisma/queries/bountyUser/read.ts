import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const get = async (userid: number, bountyid: number) => {
  return await prisma.bountyUser.findFirst({
    where: {
      userid: userid,
      bountyid: bountyid,
    },
  });
};

export const getBountyUpdatesCreator = async (
  userid: number,
  bountyids?: number[]
) => {
  const ids =
    bountyids ||
    (
      (await prisma.$queryRaw`
  SELECT Bounty.id
  FROM Bounty
  JOIN BountyUser ON Bounty.id = BountyUser.bountyid
  WHERE BountyUser.userid = ${userid}
  AND BountyUser.relations like '%creator%'
  AND Bounty.state NOT IN ('complete', 'canceled');
`) as [{ id: number }]
    ).map((bounty) => bounty.id);
  return prisma.bountyUser.findMany({
    where: {
      bountyid: {
        in: ids,
      },
      userid: {
        not: userid,
      },
    },
    select: {
      bounty: {
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      },
      actions: {
        where: {
          type: "request-to-submit",
        },
        select: {
          userid: true,
          type: true,
          timestamp: true,
        },
      },
    },
    orderBy: {
      bountyid: "desc",
    },
    take: 5,
  });
};

export const getBountyUpdatesLancer = async (
  userid: number,
  bountyids?: number[]
) => {
  const ids =
    bountyids ||
    (
      (await prisma.$queryRaw`
    SELECT Bounty.id
    FROM Bounty
    JOIN BountyUser ON Bounty.id = BountyUser.bountyid
    WHERE BountyUser.userid = ${userid}
    AND BountyUser.relations not like '%creator%'
    AND Bounty.state NOT IN ('complete', 'canceled');
  `) as [{ id: number }]
    ).map((bounty) => bounty.id);
  return prisma.bountyUser.findMany({
    where: {
      bountyid: {
        in: ids,
      },
      userid: userid,
    },
    select: {
      bounty: {
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      },
      actions: {
        where: {
          type: {
            in: [
              "add-to-shortlist",
              "add-approved-submitter",
              "deny-submitter",
              "remove-from-shortlist",
            ],
          },
        },
        select: {
          userid: true,
          type: true,
          timestamp: true,
        },
      },
    },
    orderBy: {
      bountyid: "desc",
    },
    take: 5,
  });
};

export const getCancelVotesLancer = async (
  userid: number,
  bountyids?: number[]
) => {
  const ids =
    bountyids ||
    (
      (await prisma.$queryRaw`
    SELECT Bounty.id
    FROM Bounty
    JOIN BountyUser ON Bounty.id = BountyUser.bountyid
    WHERE BountyUser.userid = ${userid}
    AND BountyUser.relations not like '%denied%'
    AND BountyUser.relations not like '%requested%'
    AND BountyUser.relations not like '%creator%'
    AND Bounty.state IN ('voting_to_cancel', 'canceled', 'dispute_settled');
  `) as [{ id: number }]
    ).map((bounty) => bounty.id);
  return prisma.bountyUser.findMany({
    where: {
      bountyid: {
        in: ids,
      },
      userid: {
        not: userid,
      },
    },
    select: {
      bounty: {
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      },
      actions: {
        where: {
          type: {
            in: ["vote-to-cancel", "cancel-escrow", "settle-dispute"],
          },
        },
        select: {
          userid: true,
          type: true,
          timestamp: true,
        },
      },
    },
    orderBy: {
      bountyid: "desc",
    },
    take: 5,
  });
};

export const getDisputesClient = async (
  userid: number,
  bountyids?: number[]
) => {
  const ids =
    bountyids ||
    (
      (await prisma.$queryRaw`
    SELECT Bounty.id
    FROM Bounty
    JOIN BountyUser ON Bounty.id = BountyUser.bountyid
    WHERE BountyUser.userid = ${userid}
    AND BountyUser.relations like '%creator%'
    AND Bounty.state IN ('dispute_started', 'dispute_settled');
  `) as [{ id: number }]
    ).map((bounty) => bounty.id);
  return prisma.bountyUser.findMany({
    where: {
      bountyid: {
        in: ids,
      },
    },
    select: {
      bounty: {
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      },
      actions: {
        where: {
          type: {
            in: ["start-dispute", "settle-dispute"],
          },
        },
        select: {
          userid: true,
          type: true,
          timestamp: true,
        },
      },
    },
    orderBy: {
      bountyid: "desc",
    },
    take: 5,
  });
};

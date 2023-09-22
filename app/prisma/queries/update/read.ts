import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const read = async (id: number): Promise<Prisma.QuestUpdate> => {
  const update = await prisma.questUpdate.findUnique({
    where: {
      id,
    },
  });
  return update;
};

export const getUpdatesByBounty = async (
  id: number
): Promise<Prisma.QuestUpdate[]> => {
  const bounty = await prisma.bounty.findUnique({
    where: {
      id: id,
    },
    include: {
      updates: true,
    },
  });

  return bounty.updates;
};

export const getQuestUpdatesClient = async (userid: number) => {
  const bounties = (await prisma.$queryRaw`
    SELECT Bounty.id
    FROM Bounty
    JOIN BountyUser ON Bounty.id = BountyUser.bountyid
    WHERE BountyUser.userid = ${userid}
    AND BountyUser.relations like '%creator%'
    AND Bounty.state NOT IN ('new', 'accepting_applications', 'voting_to_cancel', 'canceled')
    AND EXISTS (
      SELECT 1
      FROM QuestUpdate
      WHERE QuestUpdate.bountyid = Bounty.id
    );
  `) as [{ id: number }];
  const ids = bounties.map((bounty) => bounty.id);
  return prisma.questUpdate.findMany({
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
        },
      },
      createdAt: true,
      description: true,
      name: true,
    },
    orderBy: {
      bountyid: "desc",
    },
    take: 5,
  });
};

export const getQuestUpdatesLancer = async (userid: number) => {
  return prisma.questUpdate.findMany({
    where: {
      userid,
      state: {
        in: ["accepted", "rejected"],
      },
    },
    select: {
      bounty: {
        select: {
          id: true,
          title: true,
        },
      },
      reviewedAt: true,
      review: true,
      name: true,
      state: true,
    },
    orderBy: {
      bountyid: "desc",
    },
    take: 5,
  });
};

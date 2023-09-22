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
<<<<<<< Updated upstream
): Promise<Prisma.QuestUpdate[]> => {
=======
): Promise<Prisma.Update[]> => {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

export const getBountyUpdatesCancel = async (userid: number) => {
  const bounties = (await prisma.$queryRaw`
    SELECT Bounty.id
    FROM Bounty
    JOIN BountyUser ON Bounty.id = BountyUser.bountyid
    WHERE BountyUser.userid = ${userid}
    AND BountyUser.relations like '%creator%'
    AND Bounty.state NOT IN ('new', 'accepting_applications', 'voting_to_cancel', 'canceled');
  `) as [{ id: number }];
  console.log("bounties", bounties);
  const ids = bounties.map((bounty) => bounty.id);
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
            in: ["vote-to-cancel", "cancel"],
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
>>>>>>> Stashed changes

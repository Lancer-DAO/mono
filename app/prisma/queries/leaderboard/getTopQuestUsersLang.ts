import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import { subDays, format } from "date-fns";

export const getTopQuestUsersLang = async (
    language: string,
    endDate?: Date,
) => {

    console.log(endDate)
    if (endDate) {
        const topDevs = await prisma.$queryRaw`
      SELECT
        User.id,
        User.name,
        COUNT(DISTINCT BountyUser.bountyid) as total_bounties
      FROM
        User
      JOIN
        BountyUser ON User.id = BountyUser.userid
      JOIN
        Bounty ON BountyUser.bountyid = Bounty.id
      JOIN
        _BountyToTag ON Bounty.id = _BountyToTag.A
      JOIN
        Tag ON _BountyToTag.B = Tag.id
      WHERE
        Bounty.state = 'complete'
        AND BountyUser.relations = 'completer'
        AND Tag.name = ${language}
        AND Bounty.createdAt <= ${endDate.getTime()}
      GROUP BY
        User.id
      ORDER BY
        total_bounties DESC
      LIMIT 10
    `;
        return topDevs;
    } else {
        const topDevs = await prisma.$queryRaw`
      SELECT
        User.id,
        User.name,
        COUNT(DISTINCT BountyUser.bountyid) as total_bounties
      FROM
        User
      JOIN
        BountyUser ON User.id = BountyUser.userid
      JOIN
        Bounty ON BountyUser.bountyid = Bounty.id
      JOIN
        _BountyToTag ON Bounty.id = _BountyToTag.A
      JOIN
        Tag ON _BountyToTag.B = Tag.id
      WHERE
        Bounty.state = 'complete'
        AND BountyUser.relations = 'completer'
        AND Tag.name = ${language}
      GROUP BY
        User.id
      ORDER BY
        total_bounties DESC
      LIMIT 10
    `;
        return topDevs;
    }
};

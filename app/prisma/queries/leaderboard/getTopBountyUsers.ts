import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getTopBountyUsers = async () => {

  const startDate = '2023-08-01';
  const endDate = '2023-08-30';


  const usersWithBountyCounts = await prisma.$queryRaw`
  SELECT User.id, User.name, COUNT(DISTINCT BountyUser.bountyid) as total_bounties
  FROM User
  JOIN BountyUser ON User.id = BountyUser.userid
  JOIN Bounty ON BountyUser.bountyid = Bounty.id
  GROUP BY User.id
  ORDER BY total_bounties DESC
  LIMIT 10;
`;

  return usersWithBountyCounts
};



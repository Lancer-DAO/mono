import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import { groupBy } from "lodash";

export const getTopEarnersLang = async (language: string) => {
  // const startDate = '2023-08-01';
  // const endDate = '2023-08-30';

  const topEarners = await prisma.$queryRaw`
  SELECT BU.userid, U.name, SUM(E.amount) AS total_earned
  FROM Escrow AS E
  JOIN Bounty AS B ON E.id = B.escrowid
  JOIN BountyUser AS BU ON B.id = BU.bountyid
  JOIN User AS U ON BU.userid = U.id
  JOIN _BountyToTag AS BT ON B.id = BT.A
  JOIN Tag AS T ON BT.B = T.id
  WHERE B.state = 'complete'
  AND BU.relations = 'completer'
  AND BU.userid NOT IN (1, 6, 55, 7, 97, 92)
  AND T.name = ${language} 
  GROUP BY BU.userid, U.name
  ORDER BY total_earned DESC
  LIMIT 20;
    `;

  return topEarners;
};

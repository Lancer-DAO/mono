import { prisma } from "@/server/db";
import { PublicKey } from "@solana/web3.js";

export const get = async (id: number) => {
  return await prisma.escrow.findUnique({
    where: {
      id: id,
    },
    include: {
      chain: true,
    },
  });
};

export const getFromACHInfo = async (amount: string, creator: string) => {
  // These two lines will fail if the amount or creator are not valid, which prevents sql injection attacks
  const validateCreator = new PublicKey(creator);
  const validateAmount = parseFloat(amount);

  const wrappedCreator = `'%${creator}%'`;

  const query = `
  SELECT B.escrowid
  FROM Bounty AS B
  JOIN BountyUser AS BU ON B.id = BU.bountyid
  JOIN User AS U ON BU.userid = U.id
  JOIN Wallet AS W ON BU.walletid = W.id
  WHERE ROUND(B.price,2) = ${amount}
  AND B.state in ("new")
  AND BU.relations like '%creator%'
  AND W.publicKey like ${wrappedCreator}
  GROUP BY BU.userid, U.name, B.escrowid
  ORDER BY B.price DESC
  LIMIT 1;
`;

  const escrows = await prisma.$queryRawUnsafe(query);

  return escrows;
};

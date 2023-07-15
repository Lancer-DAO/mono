import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  id: number,
  refferralTreasuryKey: string
): Promise<Prisma.ReferrerReferree> => {
  const referrer = await prisma.user.findFirstOrThrow({
    where: { refferralTreasuryKey },
  });
  const wallet = await prisma.wallet.findFirstOrThrow({
    where: { userid: referrer.id, isDefault: true },
  });
  return await prisma.referrerReferree.create({
    data: {
      referrerid: referrer.id,
      referreeid: id,
      walletid: wallet.id,
      relations: "referrer-referree-normal",
    },
  });
};

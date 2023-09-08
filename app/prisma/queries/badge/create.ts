import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  details: Prisma.Prisma.JsonValue,
  src: string,
  name: string
): Promise<Prisma.Badge> => {
  const bounty = await prisma.badge.create({
    data: {
      details,
      src,
      name,
      createdAt: new Date().toDateString(),
    },
  });
  return bounty;
};

export const assignBadge = async (
  badge: Prisma.Badge,
  user: Prisma.User,
  relations: string[],
  wallet?: Prisma.Wallet
): Promise<void> => {
  await prisma.badgeToUser.create({
    data: {
      badgeid: badge.id,
      userid: user.id,
      relations: relations.join(","),
      walletid: wallet?.id,
    },
  });
};

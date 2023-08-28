import { prisma } from "@/server/db";
import { Industry } from "@/types";
import * as Prisma from "@prisma/client";

export const updateReferrer = async (
  id: number,
  referrerId: number,
  walletId: number,
  refferralTreasuryKey: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      referrers: {
        create: {
          referrerid: referrerId,
          walletid: walletId,
          relations: "referrer-referree-normal",
        },
      },
      refferralTreasuryKey,
    },
  });
};

export const updateProfileNFT = async (
  id: number,
  walletId: number
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      hasProfileNFT: true,
      profileWalletId: walletId,
    },
  });
};

export const updatePicture = async (
  id: number,
  picture: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      picture,
    },
  });
};

export const updateName = async (
  id: number,
  name: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      name,
    },
  });
};

export const onboardingUpdate = async (
  id: number,
  industry: Industry,
  name: string,
  email: string,
  company: string,
  position: string,
  bio: string,
  linkedin: string,
  twitter: string,
  github: string,
  website: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      industries: {
        connect: {
          id: industry.id,
        },
      },
      name,
      email,
      company,
      position,
      bio,
      linkedin,
      twitter,
      github,
      website,
    },
  });
};

export const updateHasFinishedOnboarding = async (
  id: number
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      hasFinishedOnboarding: true,
    },
  });
};

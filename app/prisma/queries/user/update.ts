import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";
import { Industry } from "@prisma/client";

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
  industry: Prisma.Industry,
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

export const updateLinks = async (
  id: number,
  website: string,
  github: string,
  linkedin: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      website,
      github,
      linkedin,
    },
  });
};

export const updateResume = async (
  id: number,
  resume: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      resume,
    },
  });
};

export const updateIndustry = async (
  id: number,
  newIndustry: Industry,
  oldIndustry: Industry
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      industries: {
        connect: {
          id: newIndustry.id,
        },
        disconnect: {
          id: oldIndustry.id,
        },
      },
    },
  });
};

export const updateBio = async (
  id: number,
  bio: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      bio,
    },
  });
};

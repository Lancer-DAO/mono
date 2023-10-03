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

export const onboardingUpdateNoble = async (
  name: string,
  company: string,
  companyDescription: string,
  id?: number
): Promise<Prisma.User> => {
  return id
    ? await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name,
          company,
          companyDescription,
          class: "Noble",
          hasFinishedOnboarding: true,
        },
      })
    : await prisma.user.create({
        data: {
          name,
          company,
          companyDescription,
          class: "Noble",
          hasFinishedOnboarding: true,
        },
      });
};

export const onboardingUpdateLancer = async (
  name: string,
  bio: string,
  industry: Industry,
  id?: number
): Promise<Prisma.User> => {
  return id
    ? await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name,
          bio,
          industries: {
            connect: {
              id: industry.id,
            },
          },
          class: "Lancer",
          hasFinishedOnboarding: true,
        },
      })
    : await prisma.user.create({
        data: {
          name,
          bio,
          industries: {
            connect: {
              id: industry.id,
            },
          },
          class: "Lancer",
          hasFinishedOnboarding: true,
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
      experience: {
        increment: 10, // add 10 XP for finishing onboarding
      },
    },
  });
};

export const updateLinks = async (
  id: number,
  website: string,
  twitter: string,
  github: string,
  linkedin: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      website,
      twitter,
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

export const updateCompanyDescription = async (
  id: number,
  companyDescription: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      companyDescription,
    },
  });
};

export const updateXP = async (
  id: number,
  addXP: number
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      experience: {
        increment: addXP,
      },
    },
  });
};

export const updateHasCompletedProfile = async (
  id: number
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      hasCompletedProfile: true,
    },
  });
};

export const approveUser = async (email: string): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      email,
    },
    data: {
      hasBeenApproved: true,
    },
  });
};

export const registerOnboardingBadge = async (
  email: string
): Promise<Prisma.User> => {
  return await prisma.user.update({
    where: {
      email,
    },
    data: {
      hasOnboardingBadge: true,
    },
  });
};

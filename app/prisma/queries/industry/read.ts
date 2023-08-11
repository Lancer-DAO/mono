import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types/Bounties";

const industryQuery = async (id: number) => {
  return prisma.industry.findUnique({
    where: {
      id,
    },
    include: {
      disciplines: true,
      tags: true,
      bounties: true,
      users: true,
    },
  });
};

export type IndustryType = UnwrapPromise<ReturnType<typeof get>>;

export const get = async (id: number) => {
  const industry = await industryQuery(id);
  return industry;
};

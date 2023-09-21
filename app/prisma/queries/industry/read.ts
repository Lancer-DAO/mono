import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types/Bounties";

const industryQuery = async (id: number) => {
  return prisma.industry.findUnique({
    where: {
      id,
    },
    include: {
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

export const getMany = async () => {
  const industries = await prisma.industry.findMany({
    include: {
      tags: true,
      bounties: true,
      users: true,
    },
  });
  return industries;
};

import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types/Bounties";

const disciplineQuery = async (id: number) => {
  return prisma.discipline.findUnique({
    where: {
      id,
    },
    include: {
      industry: true,
      tags: true,
    },
  });
};

export type DisciplineType = UnwrapPromise<ReturnType<typeof get>>;

export const get = async (id: number) => {
  const discipline = await disciplineQuery(id);
  return discipline;
};

import { prisma } from "@/server/db";

export const get = async (id: number) => {
  return await prisma.escrow.findUnique({
    where: {
      id: id,
    },
  });
};

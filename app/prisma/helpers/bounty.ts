import { getOrCreateChain } from "@/prisma/helpers";
import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const createBounty = async (
  createdAt: string,
  description: string,
  estimatedTime: number,
  isPrivate: boolean,
  title: string,
  escrow: Prisma.Escrow,
  tags: Prisma.Tag[],
  user: Prisma.User,
  repository: Prisma.Repository,
): Promise<Prisma.Bounty> => {
    const bounty = await prisma.bounty.create({
        data: {
          createdAt,
          description,
          estimatedTime,
          isPrivate,
          state: "new",
          title,
          escrow: {
            connect: {
                id: escrow.id
            }
          },
          tags: {
            create: tags.map((tag) => {
              return  {
                      tagId: tag.id
                  }

          })
          },
          users: {
              create: {
                  userid: user.id,
                  relations: "[creator]"
              }
          },
          repository: {
              connect: {
                  id: repository.id
              }
          }
        },
      });
  return bounty;
};

export const getBounty = async (id: number) => {
  return prisma.bounty.findUnique({
    where : {
      id: id
    }
  })
}
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
                uuid: escrow.uuid
            }
          },
          tags: {
            create: tags.map((tag) => {
                return  {
                        tagUuid: tag.uuid
                    }

            })
          },
          users: {
              create: {
                  userUuid: user.uuid,
                  relations: ["creator"]
              }
          },
          repository: {
              connect: {
                  uuid: repository.uuid
              }
          }
        },
      });
  return bounty;
};


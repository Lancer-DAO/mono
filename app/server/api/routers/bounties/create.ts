import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";

export const createBounty = protectedProcedure
  .input(
    z.object({
      session: z.string(),
      description: z.string(),
      estimatedTime: z.number(),
      isPrivate: z.boolean(),
      title: z.string(),
      type: z.string(),
      issueNumber: z.string(),
      organization: z.string(),
      repositoryName: z.string(),
    })
  )
  .mutation(async ({ input: { session,
    description,
    estimatedTime,
    isPrivate,
    title,
    type,
    issueNumber,
    organization,
    repositoryName } }) => {
    const { email } = await magic.users.getMetadataByToken(session);
    const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      let repository = await prisma.repository.findFirst({
        where: {
          name: repositoryName,
          organizationName: organization
        },
      });
      if(!repository) {
        await prisma.repository.create({data: {
            name: repositoryName,
            organizationName: organization
        }})
      }
      repository = await prisma.repository.findFirst({
        where: {
          name: repositoryName,
          organizationName: organization
        },
      });
      await prisma.bounty.create({
        data: {
          description,
          estimatedTime,
          isPrivate,
            state: "new",
            title,
            type,
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
            },
            issue: {
                create: {
                    title,
                    number: issueNumber,
                    repository: {
                        connect: {
                            uuid: repository.uuid
                        }
                    }
                }
            }

        },
      });
  });

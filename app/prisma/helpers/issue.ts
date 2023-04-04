import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const createIssue = async (
  title: string,
  number: number,
  description: string,
  linkingMethod: string,
  repository: Prisma.Repository,
  bounty: Prisma.Bounty
): Promise<Prisma.Issue> => {
    const issue = await prisma.issue.create({
        data: {
            title,
            number,
            description,
            state: 'open',
            githubLink: `${repository.githubLink}/issues/${number}`,
            linkingMethod,
            repository: {
                connect: {
                    uuid: repository.uuid
                }
            },
            bounty: {
                connect: {
                    uuid: bounty.uuid
                }
            },
        }
      })
  return issue;
};

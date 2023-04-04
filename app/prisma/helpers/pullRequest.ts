import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const createPullRequest = async (
  title: string,
  number: number,
  description: string,
  repository: Prisma.Repository,
  bounty: Prisma.Bounty,
  issue?: Prisma.Issue
): Promise<Prisma.PullRequest> => {
    let createData: Prisma.Prisma.PullRequestCreateInput =  {
            title,
            number,
            description,
            state: 'open',
            githubLink: `${repository.githubLink}/pull/${number}`,
            repository: {
                connect: {
                    uuid: repository.uuid
                }
            },
            bounty: {
                connect: {
                    uuid: bounty.uuid
                }
            }

      }
      if(issue) {
        createData = {
            ...createData,
            issue: {
                connect: {
                    uuid: issue.uuid
                }
            }
        }
      }
    const pullRequest = await prisma.pullRequest.create({data: createData})
  return pullRequest;
};

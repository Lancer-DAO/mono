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
                    id: repository.id
                }
            },
            bounty: {
                connect: {
                    id: bounty.id
                }
            }

      }
      if(issue) {
        createData = {
            ...createData,
            issue: {
                connect: {
                    id: issue.id
                }
            }
        }
      }
    const pullRequest = await prisma.pullRequest.create({data: createData})
  return pullRequest;
};

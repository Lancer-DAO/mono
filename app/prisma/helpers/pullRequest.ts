import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const createPullRequest = async (
  user: Prisma.User & {
    bounties: Prisma.BountyUser[];
  },
  repository: Prisma.Repository,
  issueNumber: number,
  pullNumber: number
): Promise<Prisma.PullRequest> => {
  const issue = await prisma.issue.findFirstOrThrow({
    where: {
      number: issueNumber,
      repositoryid: repository.id,
    },
    include: {
      bounty: true,
    },
  });

  const pullRequest = await prisma.pullRequest.create({
    data: {
      number: pullNumber,
      githubLink: `${repository.githubLink}/pulls/${pullNumber}`,
      state: "Open",
      users: {
        connect: [{ id: user.id }],
      },
      repository: {
        connect: {
          id: repository.id,
        },
      },
      bounty: {
        connect: {
          id: issue.bountyid,
        },
      },
      issue: {
        connect: {
          id: issue.id,
        },
      },
    },
  });
  const existingRelation = user.bounties.find(
    (bounty) => bounty.bountyid === issue.bountyid
  );
  if (existingRelation) {
    const relationsListOld = existingRelation.relations
      .replace(/[\[\]]/g, "")
      .split(",");
    const relations = [...relationsListOld, "pull-submitter"];
    const bountyUser = await prisma.bountyUser.update({
      where: {
        userid_bountyid: {
          userid: user.id,
          bountyid: issue.bountyid,
        },
      },
      data: {
        relations: relations.join(",").replace(/[\[\]]/g, ""),
      },
    });
  } else {
    const bountyUser = await prisma.bountyUser.create({
      data: {
        userid: user.id,
        bountyid: issue.bountyid,
        relations: "pull-submitter",
      },
    });
  }

  return pullRequest;
};

export const getPullRequest = async (
  repositoryId: number,
  pullNumber: number
): Promise<Prisma.PullRequest> => {
  const pullRequest = await prisma.pullRequest.findFirst({
    where: {
      number: pullNumber,
      repositoryid: repositoryId,
    },
  });
  return pullRequest;
};

export const getPullRequestByID = async (
  id: number
): Promise<Prisma.PullRequest> => {
  const pullRequest = await prisma.pullRequest.findFirst({
    where: {
      id,
    },
  });
  return pullRequest;
};

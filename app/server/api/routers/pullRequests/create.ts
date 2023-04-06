import { prisma } from "@/server/db";
import { publicProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";
import * as helpers from "@/prisma/helpers";

export const createPullRequest = publicProcedure
  .input(
    z.object({
      githubLogin: z.string(),
      repositoryName: z.string(),
      organizationName: z.string(),
      issueNumber: z.number(),
      pullNumber: z.number(),
    })
  )
  .mutation(async ({
    input: {
        githubLogin,
        repositoryName,
      organizationName,
        issueNumber,
        pullNumber
  } }) => {
    try {

        const user = await prisma.user.findFirstOrThrow({
            where: {
                githubLogin
            }
        })
        const repository = await prisma.repository.findUniqueOrThrow({
            where: {
                organization_name:{
                    name: repositoryName,
                organization: organizationName
                }

            }
        })
        let pullRequest = await helpers.getPullRequest(repository.id, pullNumber);
        if(!pullRequest) {
            return await helpers.createPullRequest(user, repository, issueNumber, pullNumber)
        }
        return pullRequest;
    } catch (e) {
        return e
    }
  });

import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";
import * as helpers from "@/prisma/helpers";

export const createIssue = protectedProcedure
  .input(
    z.object({
        number: z.number(),
      description: z.string(),
      title: z.string(),
      organizationName: z.string(),
      repositoryName: z.string(),
      bountyId: z.number(),
      linkingMethod: z.string()
    })
  )
  .mutation(async ({
    input: {
      description,
      title,
      organizationName,
      repositoryName,
      bountyId,
      linkingMethod,
      number
  } }) => {
      const bounty = await helpers.getBounty(bountyId)
      const repository = await helpers.getRepository(repositoryName, organizationName);
        const issue = await helpers.createIssue(title, number, description, linkingMethod, repository, bounty)
      return issue;
  });

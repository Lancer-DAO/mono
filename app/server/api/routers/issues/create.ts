import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
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
      linkingMethod: z.string(),
      currentUserId: z.number(),
    })
  )
  .mutation(
    async ({
      input: {
        description,
        title,
        organizationName,
        repositoryName,
        bountyId,
        linkingMethod,
        number,
        currentUserId,
      },
    }) => {
      const bounty = await helpers.getBounty(bountyId, currentUserId);
      const repository = await helpers.getRepository(
        repositoryName,
        organizationName
      );
      const issue = await helpers.createIssue(
        title,
        number,
        description,
        linkingMethod,
        repository,
        bounty
      );
      return await helpers.getBounty(bountyId, currentUserId);
    }
  );

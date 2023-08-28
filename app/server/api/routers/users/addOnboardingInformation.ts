import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const addOnboardingInformation = protectedProcedure
  .input(
    z.object({
      industryId: z.number(),
      name: z.string(),
      company: z.string(),
      position: z.string(),
      bio: z.string(),
      linkedin: z.string(),
      twitter: z.string(),
      github: z.string(),
      website: z.string(),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        industryId,
        name,
        company,
        position,
        bio,
        linkedin,
        twitter,
        github,
        website,
      },
    }) => {
      const { email, id } = ctx.user;

      const industry = await prisma.industry.findFirstOrThrow({
        where: { id: industryId },
      });

      return await queries.user.onboardingUpdate(
        id,
        industry,
        name,
        email,
        company,
        position,
        bio,
        linkedin,
        twitter,
        github,
        website
      );
    }
  );

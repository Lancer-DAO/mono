import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { updateHasFinishedOnboarding } from "@/prisma/queries/user";

export const addOnboardingInformation = protectedProcedure
  .input(
    z.object({
      industryId: z.optional(z.number()),
      name: z.string(),
      company: z.optional(z.string()),
      bio: z.optional(z.string()),
      selectedClass: z.string(),
      companyDescription: z.optional(z.string()),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        industryId,
        name,
        company,
        bio,
        selectedClass,
        companyDescription,
      },
    }) => {
      const { id } = ctx.user;

      if (selectedClass === "Noble") {
        await queries.user.onboardingUpdateNoble(
          id,
          name,
          company,
          companyDescription
        );
      } else {
        const industry = await prisma.industry.findFirstOrThrow({
          where: { id: industryId },
        });
        await queries.user.onboardingUpdateLancer(id, name, bio, industry);
      }

      return { success: true };
    }
  );

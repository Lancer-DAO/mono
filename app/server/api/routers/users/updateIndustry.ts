import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateIndustry = protectedProcedure
  .input(
    z.object({
      newIndustryId: z.number(),
      oldIndustryId: z.number(),
    })
  )
  .mutation(async ({ ctx, input: { newIndustryId, oldIndustryId } }) => {
    const { id } = ctx.user;

    if (newIndustryId !== oldIndustryId) {
      const newIndustry = await queries.industry.get(newIndustryId);
      const oldIndustry = await queries.industry.get(oldIndustryId);
      await queries.user.updateIndustry(id, newIndustry, oldIndustry);
    }

    return { id };
  });

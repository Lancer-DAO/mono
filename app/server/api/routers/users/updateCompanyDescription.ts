import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateCompanyDescription = protectedProcedure
  .input(
    z.object({
      companyDescription: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { companyDescription } }) => {
    const { id } = ctx.user;

    await queries.user.updateCompanyDescription(id, companyDescription);

    return { companyDescription };
  });

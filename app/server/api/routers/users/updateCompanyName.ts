import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateCompanyName = protectedProcedure
  .input(
    z.object({
      companyName: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { companyName } }) => {
    const { id } = ctx.user;

    await queries.user.updateCompanyName(id, companyName);

    return { companyName };
  });

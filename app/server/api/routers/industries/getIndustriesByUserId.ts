import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const getIndustriesByUserId = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
    })
  )
  .query(async ({ input: { userId } }) => {
    return await queries.industry.getIndustriesByUserId(userId);
  });

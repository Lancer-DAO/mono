import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getCompletedBountiesForUser = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
      page: z.number(),
    })
  )
  .query(async ({ input: { userId, page } }) => {
    return await queries.bounty.getCompletedForUser(page, userId);
  });

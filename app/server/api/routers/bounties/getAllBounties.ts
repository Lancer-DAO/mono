import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getAllBounties = protectedProcedure
  .input(
    z.object({
      currentUserId: z.number().optional(),
      page: z.number(),
    })
  )
  .query(async ({ input: { currentUserId, page } }) => {
    return await queries.bounty.getMany(page, currentUserId);
  });

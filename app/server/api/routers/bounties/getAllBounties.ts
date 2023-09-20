import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getAllBounties = protectedProcedure
  .input(
    z.object({
      currentUserId: z.number(),
      onlyMyBounties: z.boolean(),
    })
  )
  .query(async ({ input: { currentUserId } }) => {
    return await queries.bounty.getMany(currentUserId);
  });

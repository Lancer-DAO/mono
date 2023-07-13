import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { getBounties } from "@/prisma/helpers";

export const getAllBounties = protectedProcedure
  .input(
    z.object({
      currentUserId: z.number(),
      onlyMyBounties: z.boolean(),
    })
  )
  .mutation(async ({ input: { currentUserId, onlyMyBounties } }) => {
    return await getBounties(currentUserId, onlyMyBounties);
  });

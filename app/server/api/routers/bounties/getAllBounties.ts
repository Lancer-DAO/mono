import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { getBounties } from "@/prisma/helpers";

export const getAllBounties = protectedProcedure
  .input(
    z.object({
      currentUserId: z.optional(z.number()),
    })
  )
  .mutation(async ({ input: { currentUserId } }) => {
    return await getBounties(currentUserId);
  });

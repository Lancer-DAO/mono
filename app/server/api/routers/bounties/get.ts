import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";
import { getBounty as helper } from "@/prisma/helpers";

export const getBounty = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      currentUserId: z.number()
    })
  )
  .mutation(async ({ input: { id, currentUserId } }) => {


    return await helper(id, currentUserId);
  });

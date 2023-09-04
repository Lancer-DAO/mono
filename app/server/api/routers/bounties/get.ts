import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getBounty = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      currentUserId: z.number(),
    })
  )
  .query(async ({ input: { id, currentUserId } }) => {
    const ret = await queries.bounty.get(id, currentUserId);
    return ret;
  });

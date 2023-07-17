import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const search = protectedProcedure
  .input(
    z.object({
      query: z.string(),
      includeCurrentUser: z.boolean().optional(),
    })
  )
  .mutation(async ({ input: { query, includeCurrentUser }, ctx }) => {
    const users = await queries.user.searchByName(
      query,
      includeCurrentUser,
      ctx.user.id
    );

    return users;
  });

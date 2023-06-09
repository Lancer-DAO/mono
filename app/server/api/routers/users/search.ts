import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as helpers from "@/prisma/helpers";

export const search = protectedProcedure
  .input(
    z.object({
      query: z.string(),
      includeCurrentUser: z.boolean().optional(),
    })
  )
  .mutation(async ({ input: { query, includeCurrentUser }, ctx }) => {
    const users = await helpers.searchUserByName(
      query,
      includeCurrentUser,
      ctx.user.id
    );

    return users;
  });

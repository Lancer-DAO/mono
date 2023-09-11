import { prisma } from "@/server/db";
import { protectedProcedure } from "../../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getBounty = protectedProcedure
  .input(
    z.object({
      query: z.string(),
    })
  )
  .query(async ({ input: { query } }) => {
    await prisma.tag.findMany({
      where: {
        // full text search on name
        name: {
          contains: query,
        },
      },
      select: {
        name: true,
        bgColor: true,
        borderColor: true,
      },
    });
  });

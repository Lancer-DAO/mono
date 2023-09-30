import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getCancelVotesLancer = protectedProcedure
  .input(
    z.optional(
      z.object({
        bountyids: z.array(z.number()),
      })
    )
  )
  .query(
    async ({
      ctx: {
        user: { id },
      },
      input,
    }) => {
      const bountyids = input?.bountyids;

      const ret = await queries.bountyUser.getCancelVotesLancer(id, bountyids);
      return ret;
    }
  );

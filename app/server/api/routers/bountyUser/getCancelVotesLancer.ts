import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getCancelVotesLancer = protectedProcedure.query(
  async ({
    ctx: {
      user: { id },
    },
  }) => {
    const ret = await queries.bountyUser.getBountyUpdatesCancel(id);
    return ret;
  }
);

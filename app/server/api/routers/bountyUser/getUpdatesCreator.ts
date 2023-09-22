import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getBountyUpdatesCreator = protectedProcedure.query(
  async ({
    ctx: {
      user: { id },
    },
  }) => {
    const ret = await queries.bountyUser.getBountyUpdatesCreator(id);
    return ret;
  }
);

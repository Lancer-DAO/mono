
import * as queries from "@/prisma/queries";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getQuoteByBountyAndUser = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      userId: z.number(),
    })
  )
  .query(
    async ({ input: { bountyId, userId } }) => {
      return await queries.quote.getQuoteByBountyAndUser(bountyId, userId);
    }
  );

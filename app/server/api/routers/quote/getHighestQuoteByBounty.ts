import * as queries from "@/prisma/queries";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getHighestQuoteByBounty = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
    })
  )
  .query(async ({ input: { bountyId } }) => {
    return await queries.quote.getHighestQuoteByBounty(bountyId);
  });

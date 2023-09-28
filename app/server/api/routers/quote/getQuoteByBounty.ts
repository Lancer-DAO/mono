import * as queries from "@/prisma/queries";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getQuotesByBounty = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .query(
    async ({ input: { id } }) => {
      return await queries.quote.getQuotesByBounty(id);
    }
  );

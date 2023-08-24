import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getAllBounties = protectedProcedure
  .input(
    z.object({
      currentUserId: z.number(),
      onlyMyBounties: z.boolean(),
      filteredUserId: z.optional(z.number()),
    })
  )
  .mutation(
    async ({ input: { currentUserId, onlyMyBounties, filteredUserId } }) => {
      return await queries.bounty.getMany(
        currentUserId,
        onlyMyBounties,
        filteredUserId
      );
    }
  );

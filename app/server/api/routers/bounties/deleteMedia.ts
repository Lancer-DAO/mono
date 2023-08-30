import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { utapi } from "uploadthing/server"

export const deleteMedia = protectedProcedure
  .input(
    z.object({
      
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


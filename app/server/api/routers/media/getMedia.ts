import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const getMedia = protectedProcedure
  .input(
    z.object({
      userId: z.number(),
    })
  )
  .query(
    async ({ input: { userId } }) => {
      return await queries.media.getMediaByUser(userId);
    }
  );

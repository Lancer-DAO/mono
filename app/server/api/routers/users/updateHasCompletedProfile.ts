import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateHasCompletedProfile = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ input: { id } }) => {
    await queries.user.updateHasCompletedProfile(id);
    return;
  });

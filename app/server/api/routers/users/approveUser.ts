

import * as queries from "@/prisma/queries";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const approveUser = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input: { id } }) => {
    const user = await queries.user.updateHasBeenApproved(id);

    return { success: true };
  });
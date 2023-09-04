import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateBio = protectedProcedure
  .input(
    z.object({
      bio: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { bio } }) => {
    const { id } = ctx.user;

    await queries.user.updateBio(id, bio);

    return { bio };
  });

import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateName = protectedProcedure
  .input(
    z.object({
      name: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { name } }) => {
    const { id } = ctx.user;

    await queries.user.updateName(id, name);

    return { name };
  });

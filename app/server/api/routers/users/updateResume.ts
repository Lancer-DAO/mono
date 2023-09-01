
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateResume = protectedProcedure
  .input(
    z.object({
      resume: z.string(),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        resume,
      }
    }) => {
      const { id } = ctx.user;

      await queries.user.updateResume(
        id,
        resume,
      )

      return { resume };
    });
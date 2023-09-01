import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateLinks = protectedProcedure
  .input(
    z.object({
      website: z.string(),
      github: z.string(),
      linkedin: z.string(),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        website,
        github,
        linkedin
      }
    }) => {
      const { id } = ctx.user;

      await queries.user.updateLinks(
        id,
        website,
        github,
        linkedin
      )

      return { website, github, linkedin };
    });
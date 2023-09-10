import * as queries from "@/prisma/queries";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const updateLinks = protectedProcedure
  .input(
    z.object({
      website: z.string(),
      twitter: z.string(),
      github: z.string(),
      linkedin: z.string(),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        website,
        twitter,
        github,
        linkedin
      }
    }) => {
      const { id } = ctx.user;

      await queries.user.updateLinks(
        id,
        website,
        twitter,
        github,
        linkedin
      )

      return { website, twitter, github, linkedin };
    });
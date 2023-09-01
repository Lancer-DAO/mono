import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateMedia = protectedProcedure
  .input(
    z.object({
      imageUrl: z.string(),
      title: z.string(),
      description: z.string(),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        imageUrl,
        title,
        description,
      }
    }) => {
      const { id } = ctx.user;

      await queries.user.updateMedia(
        id,
        imageUrl,
        title,
        description
      );

      return { imageUrl, title, description };
    });
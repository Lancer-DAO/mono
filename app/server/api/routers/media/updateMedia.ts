
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const updateMedia = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      imageUrl: z.string(),
      title: z.string(),
      description: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        id,
        imageUrl,
        title,
        description,
      }
    }) => {
      await queries.media.update(
        id,
        imageUrl,
        title,
        description
      );

      return { imageUrl, title, description };
    });
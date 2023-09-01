
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const createMedia = protectedProcedure
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

      return await queries.media.create(
        id,
        imageUrl,
        title,
        description
      );
    });
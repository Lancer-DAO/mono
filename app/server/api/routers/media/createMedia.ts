
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
      input: {
        imageUrl,
        title,
        description,
      }
    }) => {
      return await queries.media.create(
        imageUrl,
        title,
        description
      );
    });
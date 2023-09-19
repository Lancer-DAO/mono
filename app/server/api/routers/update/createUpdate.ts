import * as queries from "@/prisma/queries";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const createUpdate = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      name: z.string(),
      type: z.string(),
      description: z.string(),
      media: z.array(
        z.object({
          imageUrl: z.string(),
          title: z.string(),
          description: z.string(),
        })
      ),
      links: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        bountyId,
        name,
        type,
        description,
        media,
        links,
      }
    }) => {
       const medias = await Promise.all(
        media.map(
          async (med) =>
            await queries.media.create(med.imageUrl, med.description, med.title)
        )
      );
      return await queries.update.create(
        bountyId,
        name,
        type,
        description,
        medias,
        links,
      )
    }
  )
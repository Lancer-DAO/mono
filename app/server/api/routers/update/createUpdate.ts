import * as queries from "@/prisma/queries";
import { QuestProgressState } from "@/types";
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
      state: z.nativeEnum(QuestProgressState),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        bountyId,
        name,
        type,
        description,
        media,
        links,
        state,
      }
    }) => {
      const { id: userId } = ctx.user;

       const medias = await Promise.all(
        media.map(
          async (med) =>
            await queries.media.create(med.imageUrl, med.description, med.title)
        )
      );
      return await queries.update.create(
        userId,
        bountyId,
        name,
        type,
        description,
        medias,
        links,
        state,
      )
    }
  )
import * as queries from "@/prisma/queries";
import {
  BountyState,
  BOUNTY_USER_RELATIONSHIP,
  QuestProgressState,
} from "@/types";
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
      input: { bountyId, name, type, description, media, links, state },
    }) => {
      const { id: userId } = ctx.user;
      await queries.bounty.updateState(bountyId, BountyState.AWAITING_REVIEW);
      const user = await queries.user.getById(userId);
      await queries.bountyUser.updateRelations(
        bountyId,
        [BOUNTY_USER_RELATIONSHIP.CurrentSubmitter],
        user
      );
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
        state
      );
    }
  );

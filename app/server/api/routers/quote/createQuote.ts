import * as queries from "@/prisma/queries";
import { QuestProgressState } from "@/types";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const createQuote = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      title: z.string(),
      description: z.string(),
      estimatedTime: z.number(),
      price: z.number(),
      state: z.nativeEnum(QuestProgressState),
      checkpoints: z.array(
        z.object({
          title: z.string(),
          price: z.number(),
          description: z.string(),
          estimatedTime: z.number(),
        })
      ),
    })
  )
  .mutation(
    async ({
      ctx,
      input: {
        bountyId,
        title,
        description,
        estimatedTime,
        price,
        state,
        checkpoints,
      }
    }) => {
      const { id: userId } = ctx.user;

      const quote = await queries.quote.create(
        userId,
        bountyId,
        title,
        description,
        estimatedTime,
        price,
        state,
      )

      await Promise.all(
        checkpoints.map(
          async (checkpoint, index) =>
          await queries.checkpoint.create(
            quote.id, checkpoint.title, checkpoint.price, checkpoint.description, checkpoint.estimatedTime, index
          )
        )
      );

      return quote;
    }
  )
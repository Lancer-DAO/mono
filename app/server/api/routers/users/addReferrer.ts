import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as helpers from "@/prisma/helpers";

export const addReferrer = protectedProcedure
  .input(
    z.object({
      walletId: z.number(),
      referrerId: z.number(),
    })
  )
  .mutation(async ({ ctx, input: { walletId, referrerId } }) => {
    const { id } = ctx.user;
    const existingReferrer = await prisma.referrerReferree.findFirst({
      where: {
        referrerid: referrerId,
        referreeid: id,
      },
    });

    if (existingReferrer) {
      throw new Error("You already have this referrer");
    }

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        referrers: {
          create: {
            referrerid: referrerId,
            walletid: walletId,
            relations: "referrer-referree-normal",
          },
        },
        refferralTreasuryKey: "UPDATE-ME",
      },
    });

    const updatedUser = await helpers.getUserById(id);
    return updatedUser;
  });

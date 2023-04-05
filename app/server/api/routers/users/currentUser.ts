import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";

export const currentUser = protectedProcedure
  .input(
    z.object({
      session: z.string(),
    })
  )
  .mutation(async ({ input: { session } }) => {
    const { email } = await magic.users.getMetadataByToken(session);

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  });

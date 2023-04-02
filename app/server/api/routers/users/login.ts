import { prisma } from "@/server/db";
import { publicProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";

export const login = publicProcedure
  .input(
    z.object({
      session: z.string(),
      publicKey: z.string(),
      githubId: z.string(),
    })
  )
  .mutation(async ({ input: { session, publicKey, githubId } }) => {
    const { email } = await magic.users.getMetadataByToken(session);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          email,
          githubId,
          wallets: {
            create: {pubkey: publicKey, provider: "Magic Link"}
          }
        },
      });
    }
  });

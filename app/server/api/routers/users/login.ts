import { prisma } from "@/server/db";
import { publicProcedure } from "../../trpc";
import { z } from "zod";

export const login = publicProcedure
  .input(
    z.object({
      session: z.string(),
      publicKey: z.string(),
      githubId: z.string(),
      githubLogin: z.string(),
    })
  )
  .mutation(async ({ input: { publicKey, githubId, githubLogin }, ctx }) => {
    const { email, id } = ctx.user;
    let user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        wallets: true,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          email,
          githubId,
          githubLogin,
          wallets: {
            create: {
              publicKey: publicKey,
              providers: {
                connect: {
                  name: "Magic Link",
                },
              },
            },
          },
        },
      });
    }
    user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        wallets: true,
      },
    });
    return user;
  });

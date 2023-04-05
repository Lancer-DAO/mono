import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";

export const getBounty = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .mutation(async ({ input: { id } }) => {
    const bounty = await prisma.bounty.findUnique({
        where: {
            id
        },
        include: {
            repository: true,
            escrow: true,
            users: true,
            issue: true,
            tags: true
        }
    })
    const users = await prisma.user.findMany({
        where: {
            id: {
                in: bounty.users.map((bountyUser) => bountyUser.userid)
            }
        }
    })

    return {...bounty, rawUsers: users, userRelations: bounty.users, users:[]};
  });

import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";
import { getBounty } from "@/prisma/helpers";

export const updateBountyUser = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      currentUserId: z.number(),
      userId: z.number(),
      walletId: z.number(),
      escrowId: z.number(),
      relations: z.array(z.string()),
      state: z.string(),
      label: z.string(),
      signature: z.string(),
    })
  )
  .mutation(async ({ input: { bountyId, currentUserId, userId, walletId, escrowId, relations, state, label, signature } }) => {

    let bounty;
    let transaction;
    let userBounty = await prisma.bountyUser.findFirst({
        where: {
            userid: userId,
            bountyid: bountyId,
        }
    });
    console.log('relations',relations)
    if(!userBounty) {
      console.log('new')
      userBounty = await prisma.bountyUser.create({
        data: {
          userid: userId,
          bountyid: bountyId,
          relations: relations.join()
        }
      })
    } else {
      console.log('exists')
      await prisma.bountyUser.update({
        where: {
          userid_bountyid:{
            userid: userId,
          bountyid: bountyId
          }
        },
        data: {
          relations: relations.join()
        }
      })
    }
    if(state) {

      bounty = await prisma.bounty.update({
        where: {
            id: bountyId
        },
        data: {
            state
        }
    })


    }
    if(signature || label) {
      const escrow = await prisma.escrow.findUnique({
        where : {
          id: escrowId
        }
      });
       transaction = await prisma.transaction.create({
        data: {
          timestamp: Date.now().toString(),
          signature,
          label,
          wallets: {
            create: {
              walletid: walletId,
              relations: "",
            }
          },
          escrowid: escrowId,
          chainid: escrow.chainid,

        }
       })
    }
    const updatedBounty = await getBounty(bountyId, currentUserId);
    return { updatedBounty };
  });

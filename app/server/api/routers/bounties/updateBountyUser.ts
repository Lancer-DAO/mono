import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import {
  getBounty,
  getOrCreateWallet,
  getPullRequest,
  getPullRequestByID,
  getRepository,
  getRepositoryByID,
  getUserById,
} from "@/prisma/helpers";
import { Octokit } from "octokit";
import axios from "axios";

export const updateBountyUser = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      currentUserId: z.number(),
      userId: z.number(),
      publicKey: z.string(),
      provider: z.string(),
      escrowId: z.number(),
      relations: z.array(z.string()),
      state: z.optional(z.string()),
      label: z.string(),
      signature: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        bountyId,
        currentUserId,
        userId,
        publicKey,
        escrowId,
        relations,
        state,
        label,
        signature,
        provider,
      },
      ctx,
    }) => {
      const user = await getUserById(userId);

      const wallet = await getOrCreateWallet(user, publicKey);
      console.error("test");
      let bounty;
      let transaction;
      let userBounty = await prisma.bountyUser.findFirst({
        where: {
          userid: userId,
          bountyid: bountyId,
        },
      });
      if (!userBounty) {
        userBounty = await prisma.bountyUser.create({
          data: {
            userid: userId,
            bountyid: bountyId,
            relations: relations.join(),
          },
        });
      } else {
        await prisma.bountyUser.update({
          where: {
            userid_bountyid: {
              userid: userId,
              bountyid: bountyId,
            },
          },
          data: {
            relations: relations.join(),
          },
        });
      }
      if (state) {
        bounty = await prisma.bounty.update({
          where: {
            id: bountyId,
          },
          data: {
            state,
          },
        });
      }
      if (signature || label) {
        const escrow = await prisma.escrow.findUnique({
          where: {
            id: escrowId,
          },
        });
        transaction = await prisma.transaction.create({
          data: {
            timestamp: Date.now().toString(),
            signature,
            label,
            wallets: {
              create: {
                walletid: wallet.id,
                relations: "",
              },
            },
            escrowid: escrowId,
            chainid: escrow.chainid,
          },
        });
      }
      const updatedBounty = await getBounty(bountyId, currentUserId);
      return { updatedBounty };
    }
  );

import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { BountyState } from "@/types/";
import { createGroupChannel } from "@/src/utils/sendbird";
import { HostedHooksClient } from "../../webhooks";
import { prisma } from "@/server/db";

export const update = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      currentUserId: z.number(),
      userId: z.number(),
      publicKey: z.string(),
      escrowId: z.number(),
      relations: z.array(z.string()),
      state: z.optional(z.string()),
      label: z.string(),
      signature: z.string(),
      applicationText: z.optional(z.string()),
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
        applicationText,
      },
    }) => {
      const user = await queries.user.getById(userId);
      const currentUser = await queries.user.getById(currentUserId);

      const wallet = await queries.wallet.getOrCreate(user, publicKey);
      let bounty;
      let transaction;
      let userBounty = await queries.bountyUser.get(userId, bountyId);

      if (!userBounty) {
        userBounty = await queries.bountyUser.create(
          bountyId,
          relations,
          user,
          wallet,
          applicationText
        );
      } else {
        await queries.bountyUser.updateRelations(bountyId, relations, user);
      }
      await queries.bountyUserAction.create(bountyId, label, user);
      if (state) {
        bounty = await queries.bounty.updateState(
          bountyId,
          state as BountyState
        );
      }
      if (signature) {
        const escrow = await queries.escrow.get(escrowId);
        transaction = await queries.transaction.create(
          Date.now().toString(),
          signature,
          label,
          wallet,
          escrow
        );
      }

      if (label === "add-approved-submitter") {
        // create a messaging group for this bounty
        const bounty = await queries.bounty.get(bountyId, currentUserId);
        const client = String(bounty.creator.userid);
        const approvedSubmitters = bounty.approvedSubmitters.map((submitter) =>
          String(submitter.userid)
        );

        console.log({
          admin: client,
          lancers: approvedSubmitters,
          name: bounty.title,
        });

        const url = await createGroupChannel({
          admin: client,
          lancers: approvedSubmitters,
          name: bounty.title,
        });

        await prisma.bounty.update({
          where: {
            id: bountyId,
          },
          data: {
            chatUrl: url,
          },
        });
      }

      const updatedBounty = await queries.bounty.get(bountyId, currentUserId);

      const webhookUpdate = {
        ...updatedBounty,
        updateType: label,
        currentUserEmail: currentUser.email,
        updatedUserEmail: user.email,
        creatorEmail: updatedBounty.creator.user.email,
        votingToCancelEmails: updatedBounty.votingToCancel.map(
          (user) => user.user.email
        ),
        needsToVoteEmails: updatedBounty.needsToVote.map(
          (user) => user.user.email
        ),
      };

      HostedHooksClient.sendWebhook(webhookUpdate, "bounty.updated");

      return updatedBounty;
    }
  );

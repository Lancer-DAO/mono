import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { BountyState } from "@/types/";
import { createGroupChannel } from "@/utils/sendbird";
import { HostedHooksClient } from "../../webhooks";

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
      },
    }) => {
      const user = await queries.user.getById(userId);

      const wallet = await queries.wallet.getOrCreate(user, publicKey);
      let bounty;
      let transaction;
      let userBounty = await queries.bountyUser.get(userId, bountyId);

      if (!userBounty) {
        userBounty = await queries.bountyUser.create(
          bountyId,
          relations,
          user,
          wallet
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
          escrow.chain,
          escrow
        );
      }

      console.log("label", label);

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

        createGroupChannel({
          admin: client,
          lancers: approvedSubmitters,
          name: bounty.title,
        });
      }

      const updatedBounty = await queries.bounty.get(bountyId, currentUserId);

      HostedHooksClient.sendWebhook(updatedBounty, "bounty.updated");

      return updatedBounty;
    }
  );

import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { BountyState } from "@/types/";
import { createGroupChannel } from "@/src/utils/sendbird";
import { HostedHooksClient } from "../../webhooks";

export const updateRelations = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      userId: z.number(),
      relations: z.array(z.string()),
    })
  )
  .mutation(
    async ({
      input: {
        bountyId,
        userId,
        relations,
      },
    }) => {
      const user = await queries.user.getById(userId);
     
      await queries.bountyUser.updateRelations(bountyId, relations, user);
      //   const currentUser = await queries.user.getById(currentUserId);

    //   const wallet = await queries.wallet.getOrCreate(user, publicKey);
    //   let bounty;
    //   let transaction;
    //   let userBounty = await queries.bountyUser.get(userId, bountyId);

    //   if (!userBounty) {
    //     userBounty = await queries.bountyUser.create(
    //       bountyId,
    //       relations,
    //       user,
    //       wallet,
    //       applicationText
    //     );
    //   } else {
    //     await queries.bountyUser.updateRelations(bountyId, relations, user);
    //   }
    //   await queries.bountyUserAction.create(bountyId, label, user);
    //   if (state) {
    //     bounty = await queries.bounty.updateState(
    //       bountyId,
    //       state as BountyState
    //     );
    //   }
    //   if (signature) {
    //     const escrow = await queries.escrow.get(escrowId);
    //     transaction = await queries.transaction.create(
    //       Date.now().toString(),
    //       signature,
    //       label,
    //       wallet,
    //       escrow.chain,
    //       escrow
    //     );
    //   }

      // if (label === "add-approved-submitter") {
      //   // create a messaging group for this bounty
      //   const bounty = await queries.bounty.get(bountyId, currentUserId);
      //   const client = String(bounty.creator.userid);
      //   const approvedSubmitters = bounty.approvedSubmitters.map((submitter) =>
      //     String(submitter.userid)
      //   );

      //   console.log({
      //     admin: client,
      //     lancers: approvedSubmitters,
      //     name: bounty.title,
      //   });

      //   createGroupChannel({
      //     admin: client,
      //     lancers: approvedSubmitters,
      //     name: bounty.title,
      //   });
      // }

      const updatedBounty = await queries.bounty.get(bountyId, userId);

      const webhookUpdate = {
        ...updatedBounty,
        updatedUserEmail: user.email,
        creatorEmail: updatedBounty.creator.user.email,
        votingToCancelEmails: updatedBounty.votingToCancel.map(
          (user) => user.user.email
        ),
        needsToVoteEmails: updatedBounty.needsToVote.map(
          (user) => user.user.email
        ),
      };

      HostedHooksClient.sendWebhook(webhookUpdate, "bounty.updatedRelations");

      return updatedBounty;
    }
  );

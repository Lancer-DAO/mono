import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { Octokit } from "octokit";
import axios from "axios";
import dayjs from "dayjs";
import { BountyState } from "@/src/types";

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
      const updatedBounty = await queries.bounty.get(bountyId, currentUserId);
      return { updatedBounty };
    }
  );
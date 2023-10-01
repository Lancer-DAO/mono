import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { ACHState, BountyState } from "@/types/";
import * as queries from "@/prisma/queries";
import { HostedHooksClient } from "../../webhooks";
import axios from "axios";

export const fundBounty = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      escrowId: z.number(),
      amount: z.number(),
      paymentId: z.optional(z.string()),
    })
  )
  .mutation(
    async ({ input: { bountyId, escrowId, amount, paymentId }, ctx }) => {
      const currentEscrow = await queries.escrow.get(escrowId);
      const escrowBalance = Number(currentEscrow.amount);

      await queries.bounty.updateState(
        bountyId,
        BountyState.ACCEPTING_APPLICATIONS
      );
      if (paymentId) {
        const { data } = await axios.get(
          `https://api.coinflow.cash/api/merchant/payments/${paymentId}`,
          {
            headers: {
              Authorization: "274881c0-100a-4fb4-9dcf-7b239f74da0f",
              accept: "application/json",
            },
          }
        );
        if (data.bankTransferInfo) {
          await queries.escrow.updateAmount(
            escrowId,
            amount,
            paymentId,
            ACHState.PRE_INITATION
          );
        } else {
          await queries.escrow.updateAmount(escrowId, escrowBalance + amount);
        }
      } else {
        await queries.escrow.updateAmount(escrowId, escrowBalance + amount);
      }

      const returnValue = await queries.bounty.get(bountyId, ctx.user.id);
      HostedHooksClient.sendWebhook(returnValue, "bounty.funded");

      return returnValue;
    }
  );

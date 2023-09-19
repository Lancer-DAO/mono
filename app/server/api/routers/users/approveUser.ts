import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { HostedHooksClient } from "../../webhooks";

export const approveUser = protectedProcedure
  .input(
    z.object({
      email: z.string(),
    })
  )
  .mutation(async ({ input: { email } }) => {
    await queries.user.approveUser(email);
    HostedHooksClient.sendWebhook(
      { event: "approve_user", userEmail: email },
      "user.approved"
    );

    return;
  });

import * as queries from "@/prisma/queries";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { HostedHooksClient } from "../../webhooks";

export const createBounty = protectedProcedure
  .input(
    z.object({
      email: z.string(),
      industryIds: z.array(z.number()),
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      links: z.array(z.string()),
      media: z.array(
        z.object({
          imageUrl: z.string(),
          title: z.string(),
          description: z.string(),
        })
      ),
      isPrivate: z.boolean(),
      isTest: z.boolean(),
      publicKey: z.string(),
      escrowKey: z.string(),
      transactionSignature: z.string(),
      timestamp: z.string(),
      mint: z.number(),
    })
  )
  .mutation(
    async ({
      input: {
        email,
        industryIds,
        title,
        description,
        tags,
        links,
        media,
        isPrivate,
        isTest,
        publicKey,
        escrowKey,
        transactionSignature,
        timestamp,
        mint,
      },
    }) => {
      const user = await queries.user.getByEmail(email);
      const wallet = await queries.wallet.getOrCreate(user, publicKey);
      const escrow = await queries.escrow.create(
        timestamp,
        escrowKey,
        user,
        mint
      );
      await queries.transaction.create(
        timestamp,
        transactionSignature,
        "create-escrow",
        wallet,
        escrow
      );
      const _tags = await Promise.all(
        tags.map((tag) => queries.tag.getOrCreate(tag))
      );
      const industries = await Promise.all(
        industryIds.map((id) => queries.industry.get(id))
      );
      const medias = await Promise.all(
        media.map(
          async (med) =>
            await queries.media.create(med.imageUrl, med.description, med.title)
        )
      );
      const bounty = await queries.bounty.create(
        timestamp,
        description,
        isPrivate,
        isTest,
        title,
        escrow,
        _tags,
        links,
        user,
        wallet,
        industries,
        medias
      );
      const bountyInfo = await queries.bounty.get(bounty.id, user.id);
      HostedHooksClient.sendWebhook(bountyInfo, "bounty.created", timestamp);
      return bountyInfo;
    }
  );

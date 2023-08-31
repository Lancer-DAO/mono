import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { HostedHooksClient } from "../../webhooks";

export const createBounty = protectedProcedure
  .input(
    z.object({
      email: z.string(),
      industryIds: z.array(z.number()),
      disciplineIds: z.array(z.number()),
      title: z.string(),
      description: z.string(),
      price: z.optional(z.number()),
      tags: z.array(z.string()),
      links: z.array(z.string()),
      media: z.array(z.string()),
      estimatedTime: z.number(),
      isPrivate: z.boolean(),
      publicKey: z.string(),
      escrowKey: z.string(),
      transactionSignature: z.string(),
      timestamp: z.string(),
      chainName: z.string(),
      mint: z.number(),
      network: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        email,
        industryIds,
        disciplineIds,
        title,
        description,
        price,
        tags,
        links,
        media,
        estimatedTime,
        isPrivate,
        publicKey,
        escrowKey,
        transactionSignature,
        timestamp,
        chainName,
        network,
        mint,
      },
    }) => {
      const user = await queries.user.getByEmail(email);
      const wallet = await queries.wallet.getOrCreate(user, publicKey);
      const chain = await queries.chain.getOrCreate(chainName, network);
      const escrow = await queries.escrow.create(
        timestamp,
        escrowKey,
        chain,
        user,
        mint
      );
      const createTx = await queries.transaction.create(
        timestamp,
        transactionSignature,
        "create-escrow",
        wallet,
        chain,
        escrow
      );
      const _tags = await Promise.all(
        tags.map((tag) => queries.tag.getOrCreate(tag))
      );
      const industries = await Promise.all(
        industryIds.map((id) => queries.industry.get(id))
      );
      const disciplines = await Promise.all(
        disciplineIds.map((id) => queries.discipline.get(id))
      );
      const bounty = await queries.bounty.create(
        timestamp,
        description,
        estimatedTime,
        isPrivate,
        title,
        escrow,
        _tags,
        links,
        media,
        user,
        wallet,
        industries,
        disciplines,
        price
      );
      const bountyInfo = await queries.bounty.get(bounty.id, user.id);

      HostedHooksClient.sendWebhook(bountyInfo, "bounty.created", timestamp);
      return bountyInfo;
    }
  );

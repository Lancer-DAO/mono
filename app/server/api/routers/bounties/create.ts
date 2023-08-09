import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const createBounty = protectedProcedure
  .input(
    z.object({
      email: z.string(),
      category: z.string(),
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      links: z.array(z.string()),
      media: z.array(z.string()),
      comment: z.string(),
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
        category,
        title,
        description,
        tags,
        links,
        media,
        comment,
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
      const bounty = await queries.bounty.create(
        timestamp,
        description,
        estimatedTime,
        isPrivate,
        title,
        category,
        escrow,
        _tags,
        links,
        media,
        comment,
        user,
        wallet
      );
      return queries.bounty.get(bounty.id, user.id);
    }
  );

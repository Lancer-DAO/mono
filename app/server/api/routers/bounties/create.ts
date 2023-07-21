import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const createBounty = protectedProcedure
  .input(
    z.object({
      email: z.string(),
      description: z.string(),
      estimatedTime: z.number(),
      isPrivate: z.boolean(),
      title: z.string(),
      tags: z.array(z.string()),
      publicKey: z.string(),
      escrowKey: z.string(),
      transactionSignature: z.string(),
      timestamp: z.string(),
      chainName: z.string(),
      network: z.string(),
      mint: z.number(),
    })
  )
  .mutation(
    async ({
      input: {
        email,
        description,
        estimatedTime,
        isPrivate,
        title,
        tags,
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
        escrow,
        _tags,
        user,
        wallet
      );
      return queries.bounty.get(bounty.id, user.id);
    }
  );

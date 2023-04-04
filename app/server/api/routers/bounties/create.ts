import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { magic } from "@/src/utils/magic-admin";
import * as helpers from "@/prisma/helpers";

export const createBounty = protectedProcedure
  .input(
    z.object({
      session: z.string(),
      description: z.string(),
      estimatedTime: z.number(),
      isPrivate: z.boolean(),
      isPrivateRepo: z.boolean(),
      title: z.string(),
      tags: z.array(z.string()),
      organizationName: z.string(),
      repositoryName: z.string(),
      publicKey: z.string(),
      transactionSignature: z.string(),
      provider: z.string(),
      timestamp: z.string(),
      chainName: z.string(),
      network: z.string(),
    })
  )
  .mutation(async ({
    input: {
      session,
      description,
      estimatedTime,
      isPrivate,
      isPrivateRepo,
      title,
      tags,
      organizationName,
      repositoryName,
      publicKey,
      transactionSignature,
      provider,
      timestamp,
      chainName,
      network
  } }) => {
    const { email } = await magic.users.getMetadataByToken(session);
    const user = await helpers.getUser("jack@sturt.io")
    console.log('user', user)
      const wallet = await  helpers.getOrCreateWallet(user, publicKey, provider);
      const repository = await helpers.getOrCreateRepository(repositoryName, organizationName, isPrivateRepo);
      const chain = await helpers.getOrCreateChain(chainName, network);
      const escrow = await helpers.createEscrow(timestamp, chain, user);
      const createTx = await helpers.createTransaction(timestamp, transactionSignature, "create-escrow", wallet, chain, escrow)
      const _tags = await Promise.all(tags.map((tag) => helpers.getOrCreateTag(tag)))
      const bounty = await helpers.createBounty(timestamp, description, estimatedTime, isPrivate, title, escrow, _tags, user, repository)
      return bounty;
  });

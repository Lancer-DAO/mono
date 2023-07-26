import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { Wallet, Program, AnchorProvider } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { getFeePayer } from "../users/maybeInitAccount";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { FEE_PAYER_ACCOUNT, MONO_ADDRESS, USDC_MINT } from "@/src/constants";
import {
  createCustodialFeatureFundingAccountInstruction,
  createReferralDataAccountInstruction,
} from "@/escrow/sdk/instructions";
import { findFeatureAccount } from "@/escrow/sdk/pda";

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
        chainName,
        network,
        mint,
      },
    }) => {
      const feePayer = getFeePayer();
      const creator = new PublicKey(publicKey);
      const connection = new Connection(
        process.env.NEXT_PUBLIC_IS_MAINNET
          ? "https://winter-necessary-smoke.solana-mainnet.discover.quiknode.pro"
          : clusterApiUrl(WalletAdapterNetwork.Devnet)
      );
      const provider = new AnchorProvider(connection, new Wallet(feePayer), {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_ADDRESS),
        provider
      );
      const timestamp = Date.now().toString();
      const ix = await createCustodialFeatureFundingAccountInstruction(
        new PublicKey(USDC_MINT),
        FEE_PAYER_ACCOUNT,
        creator,
        program,
        timestamp
      );
      const [feature_account] = await findFeatureAccount(
        timestamp,
        creator,
        program
      );

      const referralAccountIx = await createReferralDataAccountInstruction(
        creator,
        feature_account,
        program
      );
      const { blockhash, lastValidBlockHeight } =
        await provider.connection.getLatestBlockhash();
      const txInfo = {
        /** The transaction fee payer */
        feePayer: FEE_PAYER_ACCOUNT,
        /** A recent blockhash */
        blockhash: blockhash,
        /** the last block chain can advance to before tx is exportd expired */
        lastValidBlockHeight: lastValidBlockHeight,
        skipPreflight: true,
      };
      const feePayerWallet = new Wallet(feePayer);
      const tx = new Transaction(txInfo).add(ix).add(referralAccountIx);

      const signature = await sendAndConfirmTransaction(connection, tx, [
        feePayer,
      ]);
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
        signature,
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

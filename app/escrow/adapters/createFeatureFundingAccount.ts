import {
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  createCustodialFeatureFundingAccountInstruction,
  createCustodialReferralDataAccountInstruction,
  createFeatureFundingAccountInstruction,
  createReferralDataAccountInstruction,
} from "@/escrow/sdk/instructions";
import { DEVNET_USDC_MINT, USDC_MINT } from "@/src/constants";
import { findFeatureAccount } from "@/escrow/sdk/pda";
import { LancerWallet } from "@/types/";
import base58 from "bs58";
import { sendGaslessTx } from "../gasless";

export const createFFA = async (
  wallet: LancerWallet,
  program: Program<MonoProgram>
) => {
  const { ix, account, timestamp } =
    await createCustodialFeatureFundingAccountInstruction(
      new PublicKey(USDC_MINT),
      new PublicKey("pyrSoEahjKGKZpLWEYwCJ8zQAsYZckZH8ZqJ7yGd1ha"),
      new PublicKey(wallet.publicKey),
      program
    );

  const res = await sendGaslessTx([ix]);
  console.log("Sending out second tx");

  if (res.status == "error") {
    return {
      error: res.message,
    };
  } else {
    return {
      timestamp,
      signature: res.signature,
      creator: new PublicKey(wallet.publicKey),
      escrowKey: account,
    };
  }
};

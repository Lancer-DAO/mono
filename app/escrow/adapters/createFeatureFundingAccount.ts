import { AccountMeta, Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
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
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  referrer: PublicKey,
  remainingAccounts: AccountMeta[],
  mint?: PublicKey
) => {
  const timestamp = Date.now().toString();
  const ix = await createCustodialFeatureFundingAccountInstruction(
    new PublicKey(DEVNET_USDC_MINT),
    new PublicKey("pyrSoEahjKGKZpLWEYwCJ8zQAsYZckZH8ZqJ7yGd1ha"),
    new PublicKey(wallet.publicKey),
    program,
  );
  const [feature_account] = await findFeatureAccount(
    timestamp,
    new PublicKey(wallet.publicKey),
    program
  );


  const referralAccountIx = await createCustodialReferralDataAccountInstruction(
    new PublicKey(wallet.publicKey),
    new PublicKey("pyrSoEahjKGKZpLWEYwCJ8zQAsYZckZH8ZqJ7yGd1ha"),
    feature_account,
    program
  );

  const res = await sendGaslessTx([ix, referralAccountIx])
  return {
    timestamp,
    signature: res.signature,
    creator: new PublicKey(wallet.publicKey),
    escrowKey: feature_account,
  };
};

import { AccountMeta, Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  createCustodialFeatureFundingAccountInstruction,
  createFeatureFundingAccountInstruction,
  createReferralDataAccountInstruction,
} from "@/escrow/sdk/instructions";
import { USDC_MINT } from "@/src/constants";
import { findFeatureAccount } from "@/escrow/sdk/pda";
import { LancerWallet } from "@/types/";
import base58 from "bs58";

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
    mint ? mint : new PublicKey(USDC_MINT),
    new PublicKey("Am5A8sc2SrGZhzw3X81YA7NxRHKuX6KULQ8CDQbf6rWd"),
    new PublicKey(wallet.publicKey),
    program,
  );
  const [feature_account] = await findFeatureAccount(
    timestamp,
    new PublicKey(wallet.publicKey),
    program
  );

  // This needs to be fixed and updated first and then added to the Tx object

  // const referralAccountIx = await createReferralDataAccountInstruction(
  //   new PublicKey(wallet.publicKey),
  //   feature_account,
  //   program
  // );

  const tx = new Transaction().add(ix)
  const { blockhash } = await new Connection("https://solana-devnet.g.alchemy.com/v2/uUAHkqkfrVERwRHXnj8PEixT8792zETN").getLatestBlockhash()

  tx.recentBlockhash = blockhash
  tx.feePayer = new PublicKey("Am5A8sc2SrGZhzw3X81YA7NxRHKuX6KULQ8CDQbf6rWd")


  // Wallet signature not required for this tx, only fee payer's signature is required
  // const signed = await wallet.signTransaction(tx)

  const serialized = tx.serialize({requireAllSignatures: false})

  const res = await fetch("/api/gasless", {
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "body": JSON.stringify({ "transaction": base58.encode(serialized) }),
  })

  const json = await res.json()
  return {
    timestamp,
    signature: json.txid,
    creator: new PublicKey(wallet.publicKey),
    escrowKey: feature_account,
  };
};

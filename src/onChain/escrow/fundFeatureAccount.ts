import { getEndpoint } from "@/src/utils";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import {
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  createFeatureFundingAccountInstruction, fundFeatureInstruction,
} from "@/escrow/sdk/instructions";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { getFeatureFundingAccount, MyWallet } from "@/src/onChain";
import { findFeatureTokenAccount } from "@/escrow/sdk/pda";
import { LancerWallet } from "@/src/providers/lancerProvider";


export const fundFFA = async (creator: PublicKey, baseAmount: number, featureAccount: PublicKey, wallet: LancerWallet, anchor: AnchorProvider, program: Program<MonoProgram>) => {

      const amount = baseAmount * Math.pow(10, 6)
      const acc = await getFeatureFundingAccount(featureAccount, program);

    // check balaance before funding feature
    let fund_feature_ix = await fundFeatureInstruction(
      amount,
      acc.unixTimestamp,
      creator,
      new PublicKey(DEVNET_USDC_MINT),
      program
    );
    const {blockhash, lastValidBlockHeight} = (await anchor.connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: creator,
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }

      const tx2 = await wallet.signAndSendTransaction(new Transaction(txInfo).add(fund_feature_ix));
      console.log(tx2);
              return tx2;
  };
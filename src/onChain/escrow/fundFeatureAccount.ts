import { getEndpont } from "@/src/utils";
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


export const fundFFA = async (creator: Keypair, baseAmount: number, featureAccount: PublicKey) => {
      const wallet = new MyWallet(creator);
      const anchorConn = new Connection(getEndpont());
      const amount = baseAmount * Math.pow(10, 6)

      const provider = new AnchorProvider(anchorConn, wallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_DEVNET),
        provider
      );
      const acc = await getFeatureFundingAccount(creator, featureAccount);

    // check balaance before funding feature
    let fund_feature_ix = await fundFeatureInstruction(
      amount,
      acc.unixTimestamp,
      creator.publicKey,
      new PublicKey(DEVNET_USDC_MINT),
      program
    );

      const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), [creator]);
      console.log(tx2);

  };
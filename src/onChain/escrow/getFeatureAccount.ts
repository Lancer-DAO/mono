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
import { addApprovedSubmittersInstruction, fundFeatureInstruction, removeApprovedSubmittersInstruction,
} from "@/escrow/sdk/instructions";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { MyWallet } from "@/src/onChain";
import { findFeatureAccount, findFeatureTokenAccount } from "@/escrow/sdk/pda";


export const getFeatureFundingAccount = async (featureAccount: PublicKey, program: Program<MonoProgram>) => {
      const acc = await program.account.featureDataAccount.fetch(featureAccount);
      return acc;
  };
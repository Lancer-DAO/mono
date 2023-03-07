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
  createFeatureFundingAccountInstruction,
} from "@/escrow/sdk/instructions";
import { SolanaWallet } from "@web3auth/solana-provider";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { MyWallet } from "@/src/onChain";
import Base58 from 'base-58'
import { LancerWallet } from "@/src/providers/lancerProvider";

export const createFFA = async (creator: PublicKey, wallet: LancerWallet, anchor: AnchorProvider, program: Program<MonoProgram>) => {

  const timestamp = Date.now().toString();
  console.log("timestamp = ", timestamp);
      const ix = await createFeatureFundingAccountInstruction(
        new PublicKey(DEVNET_USDC_MINT),
        creator,
        program,
        timestamp
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
      const tx = await wallet.signAndSendTransaction(
        new Transaction(txInfo).add(ix)
      );
      // console.log("createFFA transaction signature", tx);
      return timestamp;
  };
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
import { addApprovedSubmittersInstruction, fundFeatureInstruction, submitRequestInstruction,
} from "@/escrow/sdk/instructions";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { getFeatureFundingAccount, MyWallet } from "@/src/onChain";
import { findFeatureAccount, findFeatureTokenAccount } from "@/escrow/sdk/pda";
import { LancerWallet } from "@/src/providers/lancerProvider";
import { EscrowContract } from "@/src/types";


export const submitRequestFFA = async (creator: PublicKey,submitter: PublicKey, acc: EscrowContract, wallet: LancerWallet, anchor: AnchorProvider, program: Program<MonoProgram>) => {

// debugger;
        const tokenAddress = await getAssociatedTokenAddress(
            new PublicKey(DEVNET_USDC_MINT),
            submitter
          );
      let approveSubmitterIx = await submitRequestInstruction(
        acc.unixTimestamp,
        creator,
        submitter,
        tokenAddress,
        program
      )

      const {blockhash, lastValidBlockHeight} = (await anchor.connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: submitter,
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await wallet.signAndSendTransaction(
        new Transaction(txInfo).add(approveSubmitterIx)
      );console.log(tx);

  };
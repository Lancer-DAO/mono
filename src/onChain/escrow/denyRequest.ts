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
import { addApprovedSubmittersInstruction, denyRequestInstruction, fundFeatureInstruction,
} from "@/escrow/sdk/instructions";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { getFeatureFundingAccount, MyWallet } from "@/src/onChain";
import { LancerWallet } from "@/src/providers/lancerProvider";


export const denyRequestFFA = async (creator: PublicKey,submitter: PublicKey, featureAccount: PublicKey, wallet: LancerWallet, anchor: AnchorProvider, program: Program<MonoProgram>) => {

      const acc = await getFeatureFundingAccount(featureAccount, program);


      let approveSubmitterIx = await denyRequestInstruction(
        acc.unixTimestamp,
        creator,
        submitter,
        program
      )

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
        new Transaction(txInfo).add(approveSubmitterIx)
      ); console.log(tx);

  };
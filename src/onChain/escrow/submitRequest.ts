import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorProvider, Program} from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {  submitRequestInstruction,
} from "@/escrow/sdk/instructions";

import { DEVNET_USDC_MINT } from "@/src/constants";
import { LancerWallet } from "@/src/providers/lancerProvider";
import { EscrowContract } from "@/src/types";


export const submitRequestFFA = async (creator: PublicKey,submitter: PublicKey, acc: EscrowContract, wallet: LancerWallet, anchor: AnchorProvider, program: Program<MonoProgram>) => {

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
      );

  };
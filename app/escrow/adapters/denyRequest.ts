import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { denyRequestInstruction } from "@/escrow/sdk/instructions";
import { Escrow, LancerWallet } from "@/src/types";


export const denyRequestFFA = async (submitter: PublicKey, acc: Escrow, wallet: LancerWallet, program: Program<MonoProgram>, provider: AnchorProvider) => {


  let approveSubmitterIx = await denyRequestInstruction(
        acc.timestamp,
        new PublicKey(wallet.publicKey),
        submitter,
        program
      )

      const {blockhash, lastValidBlockHeight} = (await provider.connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: new PublicKey(wallet.publicKey),
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await wallet.signAndSendTransaction(
        new Transaction(txInfo).add(approveSubmitterIx)
      );
      return tx
  };
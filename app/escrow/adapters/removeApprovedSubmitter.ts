import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { AnchorProvider, Program} from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {  removeApprovedSubmittersInstruction,
} from "@/escrow/sdk/instructions";

import { LancerWallet } from "@/src/providers/lancerProvider";
import { EscrowContract } from "@/src/types";
import { getCoinflowWallet } from "@/src/utils/coinflowWallet";


export const removeSubmitterFFA = async (submitter: PublicKey, acc: EscrowContract) => {
  const { coinflowWallet, program, provider } =
  await getCoinflowWallet();
      let approveSubmitterIx = await removeApprovedSubmittersInstruction(
        acc.unixTimestamp,
        coinflowWallet.publicKey,
        submitter,
        program
      )

      const {blockhash, lastValidBlockHeight} = (await provider.connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: coinflowWallet.publicKey,
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await coinflowWallet.signAndSendTransaction(
        new Transaction(txInfo).add(approveSubmitterIx)
      );

  };
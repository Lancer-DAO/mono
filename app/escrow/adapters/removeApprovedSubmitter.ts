import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  removeApprovedSubmittersInstruction,
  removeApprovedSubmittersV1Instruction,
} from "@/escrow/sdk/instructions";
import { Escrow } from "@prisma/client";
import { LancerWallet } from "@/types/";

export const removeSubmitterFFA = async (
  submitter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  let approveSubmitterIx = await removeApprovedSubmittersV1Instruction(
    acc.timestamp,
    new PublicKey(wallet.publicKey),
    submitter,
    program
  );

  const { blockhash, lastValidBlockHeight } =
    await provider.connection.getLatestBlockhash();
  const txInfo = {
    /** The transaction fee payer */
    feePayer: new PublicKey(wallet.publicKey),
    /** A recent blockhash */
    blockhash: blockhash,
    /** the last block chain can advance to before tx is exportd expired */
    lastValidBlockHeight: lastValidBlockHeight,
  };
  const tx = await wallet.signAndSendTransaction(
    new Transaction(txInfo).add(approveSubmitterIx)
  );
  return tx;
};

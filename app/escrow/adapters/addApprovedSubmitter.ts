import { AccountMeta, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  addApprovedSubmittersInstruction,
  addApprovedSubmittersV1Instruction,
} from "@/escrow/sdk/instructions";

import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/Bounties";
import { sendGaslessTx } from "../gasless";

export const addSubmitterFFA = async (
  submitter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  referrer: PublicKey,
  remainingAccounts: AccountMeta[],
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  let approveSubmitterIx = await addApprovedSubmittersV1Instruction(
    acc.timestamp,
    new PublicKey(wallet.publicKey),
    referrer,
    submitter,
    remainingAccounts,
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

export const addSubmitterFFAOld = async (
  submitter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>
) => {
  let approveSubmitterIx = await addApprovedSubmittersInstruction(
    acc.timestamp,
    new PublicKey(wallet.publicKey),
    submitter,
    program
  );

  const res = await sendGaslessTx([approveSubmitterIx], true, wallet);
  return res.signature;
};

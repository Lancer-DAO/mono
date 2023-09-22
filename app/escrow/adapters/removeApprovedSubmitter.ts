import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  removeApprovedSubmittersInstruction,
  removeApprovedSubmittersV1Instruction,
} from "@/escrow/sdk/instructions";
import { Escrow } from "@prisma/client";
import { LancerWallet } from "@/types/";
import { sendGaslessTx } from "../gasless";

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


  const res = await sendGaslessTx([approveSubmitterIx], true, wallet)
  return res.signature;
};

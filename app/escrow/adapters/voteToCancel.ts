import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { voteToCancelInstruction } from "@/escrow/sdk/instructions";
import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/";
import { sendGaslessTx } from "../gasless";

export const voteToCancelFFA = async (
  creator: PublicKey,
  voter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  let approveSubmitterIx = await voteToCancelInstruction(
    acc.timestamp,
    creator,
    voter,
    true,
    program
  );

  const res = await sendGaslessTx([approveSubmitterIx], true, wallet)
  return res.signature;
};

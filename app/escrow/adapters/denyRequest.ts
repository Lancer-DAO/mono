import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { denyRequestInstruction } from "@/escrow/sdk/instructions";
import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/Bounties";
import { sendGaslessTx } from "../gasless";

export const denyRequestFFA = async (
  submitter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  let approveSubmitterIx = await denyRequestInstruction(
    acc.timestamp,
    new PublicKey(wallet.publicKey),
    submitter,
    program
  );


  const res = await sendGaslessTx([approveSubmitterIx], true, wallet)
  return res.signature;
};

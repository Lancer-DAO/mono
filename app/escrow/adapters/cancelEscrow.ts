import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { cancelFeatureInstruction } from "@/escrow/sdk/instructions";
import { USDC_MINT } from "@/src/constants";
import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/Bounties";
import { sendGaslessTx } from "../gasless";

export const cancelFFA = async (
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  const tokenAddress = await getAssociatedTokenAddress(
    new PublicKey(acc.mint.publicKey),
    new PublicKey(wallet.publicKey)
  );
  let approveSubmitterIx = await cancelFeatureInstruction(
    acc.timestamp,
    new PublicKey(wallet.publicKey),
    tokenAddress,
    new PublicKey(acc.mint.publicKey),
    program
  );

  const res = await sendGaslessTx([approveSubmitterIx], true, wallet)
  return res.signature;
};

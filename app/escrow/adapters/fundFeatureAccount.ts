import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { fundFeatureInstruction } from "@/escrow/sdk/instructions";

import { USDC_MINT } from "@/src/constants";
import { Escrow, LancerWallet } from "@/src/types";

export const getFundFFATX = async (
  baseAmount: number,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  const amount = baseAmount * Math.pow(10, 6);
  console.log("baseAmount, amount", baseAmount, amount);
  // check balaance before funding feature
  let fund_feature_ix = await fundFeatureInstruction(
    amount,
    acc.timestamp,
    wallet.publicKey,
    new PublicKey(USDC_MINT),
    program
  );
  const { blockhash, lastValidBlockHeight } =
    await provider.connection.getLatestBlockhash();
  const txInfo = {
    /** The transaction fee payer */
    feePayer: wallet.publicKey,
    /** A recent blockhash */
    blockhash: blockhash,
    /** the last block chain can advance to before tx is exportd expired */
    lastValidBlockHeight: lastValidBlockHeight,
  };

  return new Transaction(txInfo).add(fund_feature_ix);
};

export const fundFFA = async (
  baseAmount: number,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  const tx = await getFundFFATX(baseAmount, acc, wallet, program, provider);

  return await wallet.signAndSendTransaction(tx);
};

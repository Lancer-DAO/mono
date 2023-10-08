import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  fundFeatureInstruction,
  achFundFeatureInstruction,
} from "@/escrow/sdk/instructions";

import { DEVNET_USDC_MINT, USDC_MINT } from "@/src/constants";
import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/";
import { sendGaslessTx } from "../gasless";

export const getFundFFATX = async (
  baseAmount: number,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  decimals?: number,
  mint?: PublicKey
) => {
  const amount = baseAmount * Math.pow(10, decimals ? decimals : 6);
  // check balaance before funding feature
  let fund_feature_ix = await fundFeatureInstruction(
    amount,
    acc?.timestamp,
    wallet?.publicKey,
    mint ? mint : new PublicKey(USDC_MINT),
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
  provider: AnchorProvider,
  decimals?: number,
  mint?: PublicKey
) => {
  const tx = await getFundFFATX(
    baseAmount,
    acc,
    wallet,
    program,
    provider,
    decimals,
    mint
  );

  return await wallet.signAndSendTransaction(tx);
};

export const getACHTransaction = async (
  baseAmount: number,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  decimals?: number,
  mint?: PublicKey
) => {
  const amount = baseAmount * Math.pow(10, decimals ? decimals : 6);
  // check balaance before funding feature
  let fund_feature_ix = await achFundFeatureInstruction(
    amount,
    acc?.timestamp,
    wallet?.publicKey,
    mint ? mint : new PublicKey(USDC_MINT),
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
export const fundFFATXGasless = async (
  baseAmount: number,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  decimals?: number,
  mint?: PublicKey
) => {
  const amount = baseAmount * Math.pow(10, decimals ? decimals : 6);
  // check balaance before funding feature
  let fund_feature_ix = await fundFeatureInstruction(
    amount,
    acc?.timestamp,
    wallet?.publicKey,
    // mint ? mint : new PublicKey(USDC_MINT),
    new PublicKey(USDC_MINT),
    program
  );

  const res = await sendGaslessTx([fund_feature_ix], true, wallet);

  return res;
};

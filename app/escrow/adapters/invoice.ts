import { AccountMeta, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  addApprovedSubmittersInstruction,
  addApprovedSubmittersV1Instruction,
  sendInvoiceInstruction,
  acceptInvoiceInstruction,
  rejectInvoiceInstruction,
  closeInvoiceInstruction,
} from "@/escrow/sdk/instructions";

import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/Bounties";
import { USDC_MINT } from "@/src/constants";

export const sendInvoice = async (
  invoiceRecipient: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  baseAmount: number,
  decimals?: number,
  mint?: PublicKey
) => {
  const amount = baseAmount * Math.pow(10, decimals ? decimals : 6);
  let sendInvoiceIx = await sendInvoiceInstruction(
    acc.timestamp,
    amount,
    wallet.publicKey,
    invoiceRecipient,
    mint ?? new PublicKey(USDC_MINT),
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
    new Transaction(txInfo).add(sendInvoiceIx)
  );
  return tx;
};

export const acceptInvoice = async (
  invoiceCreator: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  mint?: PublicKey
) => {
  let acceptInvoiceIx = await acceptInvoiceInstruction(
    acc.timestamp,
    invoiceCreator,
    wallet.publicKey,
    mint ?? new PublicKey(USDC_MINT),
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
    new Transaction(txInfo).add(acceptInvoiceIx)
  );
  return tx;
};

export const rejectInvoice = async (
  invoiceCreator: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  mint?: PublicKey
) => {
  let rejectInvoiceIx = await rejectInvoiceInstruction(
    acc.timestamp,
    invoiceCreator,
    wallet.publicKey,
    mint ?? new PublicKey(USDC_MINT),
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
    new Transaction(txInfo).add(rejectInvoiceIx)
  );
  return tx;
};

export const closeInvoice = async (
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  mint?: PublicKey
) => {
  let closeInvoiceIx = await closeInvoiceInstruction(
    acc.timestamp,
    wallet.publicKey,
    mint ?? new PublicKey(USDC_MINT),
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
    new Transaction(txInfo).add(closeInvoiceIx)
  );
  return tx;
};

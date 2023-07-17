import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { submitRequestInstruction } from "@/escrow/sdk/instructions";

import { USDC_MINT } from "@/src/constants";
import { LancerWallet, Escrow } from "@/src/types";
import { maybeCreateTokenAccount } from "@/src/utils";

export const submitRequestFFA = async (
  creator: PublicKey,
  submitter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  const mint = new PublicKey(acc.mint.publicKey);

  const tokenAddress = await getAssociatedTokenAddress(mint, submitter);
  await maybeCreateTokenAccount(
    tokenAddress,
    submitter,
    mint,
    wallet,
    provider.connection
  );

  let approveSubmitterIx = await submitRequestInstruction(
    acc.timestamp,
    creator,
    submitter,
    tokenAddress,
    program
  );

  const { blockhash, lastValidBlockHeight } =
    await provider.connection.getLatestBlockhash();
  const txInfo = {
    /** The transaction fee payer */
    feePayer: submitter,
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

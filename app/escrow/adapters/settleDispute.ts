import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { settleDisputeInstruction } from "@/escrow/sdk/instructions";
import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/Bounties";
import { USDC_MINT } from "@/src/constants";

export const settleDisputeFFA = async (
  amount: number,
  creator: PublicKey,
  submitter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  let approveSubmitterIx = await settleDisputeInstruction(
    acc.timestamp,
    new PublicKey("WbmLPptTGZTFK5ZSks7oaa4Qx69qS3jFXMrAsbWz1or"),
    creator,
    submitter,
    new PublicKey(USDC_MINT),
    amount * 10 ** 6,
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

import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { approveRequestWithReferralInstruction } from "@/escrow/sdk/instructions";
import { USDC_MINT } from "@/src/constants";
import { Escrow, LancerWallet } from "@/src/types";

export const approveRequestFFA = async (
  submitter: PublicKey,
  acc: Escrow,
  wallet: LancerWallet,
  buddylinkProgramId: PublicKey,
  program: Program<MonoProgram>,
  provider: AnchorProvider,
  mint?: PublicKey
) => {
  const creator = new PublicKey(wallet.publicKey);
  const tokenAddress = await getAssociatedTokenAddress(
    mint ? mint : new PublicKey(USDC_MINT),
    submitter
  );
  let approveSubmitterIx = await approveRequestWithReferralInstruction(
    acc.timestamp,
    creator,
    submitter,
    tokenAddress,
    buddylinkProgramId,
    mint ? mint : new PublicKey(USDC_MINT),
    program
  );

  const { blockhash, lastValidBlockHeight } =
    await provider.connection.getLatestBlockhash();
  const txInfo = {
    /** The transaction fee payer */
    feePayer: creator,
    /** A recent blockhash */
    blockhash: blockhash,
    /** the last block chain can advance to before tx is exportd expired */
    lastValidBlockHeight: lastValidBlockHeight,
  };
  const tx = await wallet.signAndSendTransaction(
    new Transaction(txInfo).add(approveSubmitterIx)
  );

  // buddylinkprogram
  // mint
  // array either treasury and ata

  return tx;
};

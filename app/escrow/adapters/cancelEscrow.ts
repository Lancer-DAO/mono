import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { cancelFeatureInstruction } from "@/escrow/sdk/instructions";
import { USDC_MINT } from "@/src/constants";
import { LancerWallet } from "@/types/";
import { Escrow } from "@/types/Bounties";

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

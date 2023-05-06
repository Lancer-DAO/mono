import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  createFeatureFundingAccountInstruction,
} from "@/escrow/sdk/instructions";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { findFeatureAccount } from "@/escrow/sdk/pda";
import { LancerWallet } from "@/src/types";

export const createFFA = async (wallet: LancerWallet, program: Program<MonoProgram>, provider: AnchorProvider) => {
  const timestamp = Date.now().toString();

  console.log("timestamp = ", timestamp);
      const ix = await createFeatureFundingAccountInstruction(
        new PublicKey(DEVNET_USDC_MINT),
        new PublicKey(wallet.publicKey),
        program,
        timestamp
      );
      const {blockhash, lastValidBlockHeight} = (await provider.connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: new PublicKey(wallet.publicKey),
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const signature = await wallet.signAndSendTransaction(
        new Transaction(txInfo).add(ix)
      );
      console.log('creation tx signature: ', signature)
      const [feature_account] = await findFeatureAccount(
        timestamp,
        new PublicKey(wallet.publicKey),
        program
    );
      return { timestamp,signature, creator: new PublicKey(wallet.publicKey), escrowKey: feature_account};
  };
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
import { LancerWallet } from "@/src/providers/lancerProvider";
import { getCoinflowWallet } from "@/src/utils/coinflowWallet";

export const createFFA = async () => {
  const { coinflowWallet, program, provider } =
  await getCoinflowWallet();
  const timestamp = Date.now().toString();
  console.log("timestamp = ", timestamp);
      const ix = await createFeatureFundingAccountInstruction(
        new PublicKey(DEVNET_USDC_MINT),
        coinflowWallet.publicKey,
        program,
        timestamp
      );
      const {blockhash, lastValidBlockHeight} = (await provider.connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: coinflowWallet.publicKey,
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await coinflowWallet.signAndSendTransaction(
        new Transaction(txInfo).add(ix)
      );
      console.log('creation tx signature: ', tx)

      return timestamp;
  };
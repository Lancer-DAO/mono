import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { cancelFeatureInstruction } from "@/escrow/sdk/instructions";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { LancerWallet } from "@/src/providers/lancerProvider";
import { EscrowContract } from "@/src/types";
import { getCoinflowWallet } from "@/src/utils/coinflowWallet";


export const cancelFFA = async (acc: EscrowContract  ) => {

  const { coinflowWallet, program, provider } =
  await getCoinflowWallet();
      const tokenAddress = await getAssociatedTokenAddress(
        new PublicKey(DEVNET_USDC_MINT),
        coinflowWallet.publicKey
      );
      let approveSubmitterIx = await cancelFeatureInstruction(
        acc.unixTimestamp,
        coinflowWallet.publicKey,
        tokenAddress,
        new PublicKey(DEVNET_USDC_MINT),
        program
      )

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
        new Transaction(txInfo).add(approveSubmitterIx)
      );

  };
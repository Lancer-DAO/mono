import { getEndpoint } from "@/src/utils";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import {
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { addApprovedSubmittersInstruction, approveRequestInstruction, denyRequestInstruction, fundFeatureInstruction, voteToCancelInstruction,
} from "@/escrow/sdk/instructions";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { getFeatureFundingAccount, MyWallet } from "@/src/onChain";
import { DEVNET_USDC_MINT } from "@/src/constants";


export const voteToCancelFFA = async (creator: PublicKey, voter: PublicKey, featureAccount: PublicKey, signAndSendTransaction: (tx: Transaction) => Promise<string>,  getWallet: () => MyWallet | null ) => {
      const wallet = getWallet();
      const anchorConn = new Connection(getEndpoint());

      const provider = new AnchorProvider(anchorConn, wallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_DEVNET),
        provider
      );
            const acc = await getFeatureFundingAccount(featureAccount, program);

        // debugger;
      let approveSubmitterIx = await voteToCancelInstruction(
        acc.unixTimestamp,
        creator,
        voter,
        voter.toString() === creator.toString() ? acc.funderCancel : acc.payoutCancel,
        program
      )

      const {blockhash, lastValidBlockHeight} = (await anchorConn.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: creator,
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await signAndSendTransaction(
        new Transaction(txInfo).add(approveSubmitterIx)
      );  console.log(tx);

  };
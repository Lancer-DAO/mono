import { getEndpont } from "@/src/utils";
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
import { addApprovedSubmittersInstruction, fundFeatureInstruction, submitRequestInstruction,
} from "@/escrow/sdk/instructions";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { getFeatureFundingAccount, MyWallet } from "@/src/onChain";
import { findFeatureAccount, findFeatureTokenAccount } from "@/escrow/sdk/pda";


export const submitRequestFFA = async (creator: Keypair,submitter: Keypair, featureAccount: PublicKey ) => {
      const wallet = new MyWallet(creator);
      const anchorConn = new Connection(getEndpont());

      const provider = new AnchorProvider(anchorConn, wallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_DEVNET),
        provider
      );
      const acc = await getFeatureFundingAccount(creator, featureAccount);
        const tokenAddress = await getAssociatedTokenAddress(
            new PublicKey(DEVNET_USDC_MINT),
            submitter.publicKey
          );
      let approveSubmitterIx = await submitRequestInstruction(
        acc.unixTimestamp,
        creator.publicKey,
        submitter.publicKey,
        tokenAddress,
        program
      )

      const tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [submitter]);
        console.log(tx);

  };
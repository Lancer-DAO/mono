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
import {
  createFeatureFundingAccountInstruction,
} from "@/escrow/sdk/instructions";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { MyWallet } from "@/src/onChain";


export const createFFA = async (creator: Keypair) => {
      const wallet = new MyWallet(creator);
      const anchorConn = new Connection(getEndpont());

      const anchorProvider = new AnchorProvider(anchorConn, wallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_DEVNET),
        anchorProvider
      );
      const ix = await createFeatureFundingAccountInstruction(
        new PublicKey(DEVNET_USDC_MINT),
        creator.publicKey,
        program
      );

      const tx = await anchorProvider.sendAndConfirm(
        new Transaction().add(ix),
        [creator]
      );
      console.log("createFFA transaction signature", tx);
      const accounts = await anchorProvider.connection.getParsedProgramAccounts(
        program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        {
          filters: [
            {
              dataSize: 288, // number of bytes
            },
            {
              memcmp: {
                offset: 8, // number of bytes
                bytes: creator.publicKey.toBase58(), // base58 encoded string
              },
            },
          ],
        }
      );
      const acc = await program.account.featureDataAccount.fetch(
        accounts[0].pubkey
      );
      console.log(acc);
        return acc;
  };
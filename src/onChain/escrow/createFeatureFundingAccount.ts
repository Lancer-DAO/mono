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
import {
  createFeatureFundingAccountInstruction,
} from "@/escrow/sdk/instructions";
import { SolanaWallet } from "@web3auth/solana-provider";

import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { MyWallet } from "@/src/onChain";


export const createFFA = async (creator: PublicKey, signAndSendTransaction: (tx: Transaction)=> Promise<string>, getWallet: () => MyWallet | null) => {

  const wallet = getWallet();
  const connection = new Connection(getEndpoint());

  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program<MonoProgram>(
    MonoProgramJSON as unknown as MonoProgram,
    new PublicKey(MONO_DEVNET),
    provider
  );
      const ix = await createFeatureFundingAccountInstruction(
        new PublicKey(DEVNET_USDC_MINT),
        creator,
        program
      );
      const {blockhash, lastValidBlockHeight} = (await connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: creator,
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await signAndSendTransaction(
        new Transaction(txInfo).add(ix)
      );
      console.log("createFFA transaction signature", tx);
      const accounts = await connection.getParsedProgramAccounts(
        program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        {
          filters: [
            {
              dataSize: 288, // number of bytes
            },
            {
              memcmp: {
                offset: 8, // number of bytes
                bytes: creator.toBase58(), // base58 encoded string
              },
            },
          ],
        }
      );
        return accounts[0].pubkey
  };
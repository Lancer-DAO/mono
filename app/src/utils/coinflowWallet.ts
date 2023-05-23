import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SignaturePubkeyPair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
const rpcUrl = clusterApiUrl("mainnet-beta");

interface LancerWallet extends SolanaWalletContextState {
  signAndSendTransaction: (transaction: Transaction) => Promise<string>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
}

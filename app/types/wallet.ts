import { SolanaWallet } from "@coinflowlabs/react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";

export interface LancerWallet extends SolanaWallet {
  signAndSendTransaction: (transaction: Transaction) => Promise<string>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise<T>;
  providerName?: string;
}

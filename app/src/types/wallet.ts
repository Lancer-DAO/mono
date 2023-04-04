
import { SolanaWalletContextState } from "@coinflowlabs/react";
import { Transaction} from "@solana/web3.js";

export interface LancerWallet extends SolanaWalletContextState {
    signAndSendTransaction: (transaction: Transaction) => Promise<string>;
    signAllTransactions: (
      transactions: Transaction[]
    ) => Promise<Transaction[]>;
  }
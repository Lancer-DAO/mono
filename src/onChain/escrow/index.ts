import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";

export * from "./createFeatureFundingAccount"
export * from "./fundFeatureAccount"
export * from "./addApprovedSubmitter"
export * from "./removeApprovedSubmitter"
export * from "./getFeatureAccount"
export * from "./submitRequest"
export * from "./denyRequest"
export * from "./approveRequest"
export * from "./voteToCancel"
export * from "./cancelEscrow"

// Anchor's default export sometimes throws an error saying there is no constructor, so
// make a wrapper class here to avoid the error.
export class MyWallet implements Wallet {
    constructor(readonly payer: Keypair) {
      this.payer = payer;
    }

    async signTransaction(tx: Transaction): Promise<Transaction> {
      tx.partialSign(this.payer);
      return tx;
    }

    async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
      return txs.map((t) => {
        t.partialSign(this.payer);
        return t;
      });
    }

    get publicKey(): PublicKey {
      return this.payer.publicKey;
    }
  }

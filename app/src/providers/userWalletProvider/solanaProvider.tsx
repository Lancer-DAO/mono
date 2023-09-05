import { CustomChainConfig, SafeEventEmitterProvider } from "@web3auth/base";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { useEffect, useMemo, useState } from "react";
import { LancerWallet } from "@/types/";

export type WalletActions = Omit<
  LancerWallet,
  "wallet" | "publicKey" | "connected"
>;

const solanaProvider = (provider: SafeEventEmitterProvider): WalletActions => {
  const solanaWallet = new SolanaWallet(provider);

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    try {
      const res = await solanaWallet.signMessage(message);
      return res;
    } catch (error) {
      console.error("Error", error);
    }
  };

  const signAndSendTransaction = async (
    transaction: Transaction
  ): Promise<string> => {
    try {
      const solWeb3 = new SolanaWallet(provider);

      const { signature } = await solWeb3.signAndSendTransaction(transaction);
      return signature;
    } catch (error) {
      console.error("Error", error);
    }
  };

  const signTransaction = async <T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> => {
    try {
      const solWeb3 = new SolanaWallet(provider);
      const signedTx = await solWeb3.signTransaction(transaction);
      signedTx.serialize();
      return signedTx;
    } catch (error) {
      console.error("Error", error);
    }
  };

  const signAllTransactions = async (
    transactions: Transaction[]
  ): Promise<Transaction[]> => {
    const mapped = transactions.map(async (transaction) => {
      const signed = await signTransaction(transaction);
      return signed;
    });
    return Promise.all(mapped);
  };

  return {
    signMessage,
    sendTransaction: signAndSendTransaction,
    signTransaction,
    signAllTransactions,
    signAndSendTransaction,
  };
};

export default solanaProvider;

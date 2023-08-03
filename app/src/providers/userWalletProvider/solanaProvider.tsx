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

const solanaProvider = (
  provider: SafeEventEmitterProvider,
  uiConsole: (...args: unknown[]) => void
): WalletActions => {
  const solanaWallet = new SolanaWallet(provider);

  const getConnection = async (): Promise<Connection> => {
    const connectionConfig = await solanaWallet.request<CustomChainConfig>({
      method: "solana_provider_config",
      params: [],
    });
    const conn = new Connection(connectionConfig.rpcTarget, "finalized");
    return conn;
  };

  const getBalance = async () => {
    try {
      const conn = await getConnection();
      const accounts = await solanaWallet.requestAccounts();
      const balance = await conn.getBalance(new PublicKey(accounts[0]));
      uiConsole("Solana balance", balance);
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
    }
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    try {
      const res = await solanaWallet.signMessage(message);
      uiConsole("Solana sign message", res);
      return res;
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
    }
  };

  const signAndSendTransaction = async (
    transaction: Transaction
  ): Promise<string> => {
    try {
      const solWeb3 = new SolanaWallet(provider);

      const { signature } = await solWeb3.signAndSendTransaction(transaction);
      uiConsole("signature", signature);
      return signature;
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
    }
  };

  const signTransaction = async <T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> => {
    try {
      const conn = await getConnection();
      const solWeb3 = new SolanaWallet(provider);
      const signedTx = await solWeb3.signTransaction(transaction);
      signedTx.serialize();
      uiConsole("signature", signedTx);
      return signedTx;
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
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

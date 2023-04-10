import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { SolanaExtension } from "@magic-ext/solana";
import { getEndpoint } from "./web3";
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
import { LancerWallet } from "@/src/types";
import { getCookie } from "cookies-next";
import { useCallback, useMemo } from "react";
const rpcUrl = clusterApiUrl("devnet");
// Create client-side Magic instance
const createMagic = (key: string) => {
  return typeof window != "undefined"
    ? new Magic(key, {
        extensions: [
          new OAuthExtension(),
          new SolanaExtension({
            rpcUrl: getEndpoint(),
          }),
        ],
      })
    : undefined;
};

console.log(process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY);
export const magic = createMagic("pk_live_736C8D5728FF026E");

export const createMagicWallet = async () => {
  // debugger;
  if (!magic.user.isLoggedIn()) {
    const token = getCookie("session");
    await magic.auth.loginWithCredential(token as string);
  }
  const connection = new Connection(rpcUrl, {
    commitment: "finalized",
  });

  const metadata = await magic.user.getMetadata();

  const payer = new PublicKey(metadata.publicAddress);
  const sendTransaction = async (transaction: VersionedTransaction) => {
    return await connection.sendTransaction(transaction);
  };
  const serializeConfig = {
    requireAllSignatures: false,
    verifySignatures: true,
  };
  const signTransaction = async <T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T> => {
    const serializeConfig = {
      requireAllSignatures: false,
      verifySignatures: true,
    };

    const { rawTransaction } = await magic.solana.signTransaction(
      tx,
      serializeConfig
    );
    const transaction = Transaction.from(rawTransaction);
    const missingSigners = transaction.signatures
      .filter((s) => !s.signature)
      .map((s) => s.publicKey);
    missingSigners.forEach((publicKey) => {
      const signature = (tx.signatures as SignaturePubkeyPair[]).find((s) =>
        s.publicKey.equals(publicKey)
      );
      if (signature?.signature)
        transaction.addSignature(publicKey, signature.signature);
    });

    return transaction as T;
  };
  const signMessage = async (message: string | Uint8Array) => {
    return await magic.solana.signMessage(message);
  };
  const signAndSendTransaction = async (transaction: Transaction) => {
    const signedTransaction = await magic.solana.signTransaction(
      transaction,
      serializeConfig
    );
    const tx = Transaction.from(signedTransaction.rawTransaction);
    const signature = await connection.sendRawTransaction(tx.serialize());
    return signature;
  };

  const signAllTransactions = async (transactions: Transaction[]) => {
    await transactions.forEach(async (transaction) => {
      await signTransaction(transaction);
    });
    return transactions;
  };
  const coinflowWallet: LancerWallet = {
    wallet: null,
    connected: true,
    publicKey: payer,
    sendTransaction,
    signMessage,
    signTransaction,
    signAndSendTransaction,
    signAllTransactions,
  };
  const provider = new AnchorProvider(connection, coinflowWallet, {});
  const program = new Program<MonoProgram>(
    MonoProgramJSON as unknown as MonoProgram,
    new PublicKey(MONO_DEVNET),
    provider
  );
  return { coinflowWallet, provider, program };
};

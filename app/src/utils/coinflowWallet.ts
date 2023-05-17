import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { magic } from "@/src/utils/magic";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { clusterApiUrl, Connection, PublicKey, SignaturePubkeyPair, Transaction, VersionedTransaction } from "@solana/web3.js";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
const rpcUrl = clusterApiUrl("mainnet-beta");

interface LancerWallet extends SolanaWalletContextState {
    signAndSendTransaction: (transaction: Transaction) => Promise<string>;
    signAllTransactions: (
      transactions: Transaction[]
    ) => Promise<Transaction[]>;
  }
export const getCoinflowWallet = async () => {
  const connection =  new Connection(rpcUrl)

    // debugger;
    const metadata = await magic.user.getMetadata();
    // debugger;

    const payer = new PublicKey(metadata.publicAddress);
    const sendTransaction = async (transaction: VersionedTransaction) => {
      return await connection.sendTransaction(transaction);
    };
    const serializeConfig = {
      requireAllSignatures: false,
      verifySignatures: true,
    };
    const signTransaction = async <
      T extends Transaction | VersionedTransaction
    >(
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
        const signature = (tx.signatures as SignaturePubkeyPair[]).find(
          (s) => s.publicKey.equals(publicKey)
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
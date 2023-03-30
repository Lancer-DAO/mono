import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import axios from "axios";
import {
  DEVNET_USDC_MINT,
  USER_REPOSITORIES_ROUTE,
  USER_REPOSITORY_ISSUES_ROUTE,
} from "@/src/constants";
import { Octokit } from "octokit";
import { useDebounce } from "./../src/hooks/debounce";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";

const rpcUrl = web3.clusterApiUrl("devnet");

interface LancerWallet extends SolanaWalletContextState {
  signAndSendTransaction: (transaction: web3.Transaction) => Promise<string>;
  signAllTransactions: (
    transactions: web3.Transaction[]
  ) => Promise<web3.Transaction[]>;
}

import { SolanaExtension } from "@magic-ext/solana";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import Coinflow from "@/src/pages/bounty/components/coinflowPurchase";
import { createFFA } from "@/escrow/adapters";
import { AnchorProvider, Program, setProvider } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
const getCoinflowWallet = async (magic, connection) => {
  // debugger;
  const metadata = await magic.user.getMetadata();
  // debugger;

  const payer = new web3.PublicKey(metadata.publicAddress);
  const sendTransaction = async (transaction: web3.Transaction) => {
    return await connection.sendTransaction(transaction);
  };
  const serializeConfig = {
    requireAllSignatures: false,
    verifySignatures: true,
  };
  const signTransaction = async <
    T extends web3.Transaction | web3.VersionedTransaction
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
    const transaction = web3.Transaction.from(rawTransaction);
    const missingSigners = transaction.signatures
      .filter((s) => !s.signature)
      .map((s) => s.publicKey);
    missingSigners.forEach((publicKey) => {
      const signature = (tx.signatures as web3.SignaturePubkeyPair[]).find(
        (s) => s.publicKey.equals(publicKey)
      );
      if (signature?.signature)
        transaction.addSignature(publicKey, signature.signature);
    });

    return transaction as T;
  };
  const signMessage = async (message: string | Uint8Array) => {
    return await magic.solana.signMessage(message, serializeConfig);
  };
  const signAndSendTransaction = async (transaction: web3.Transaction) => {
    const signedTransaction = await magic.solana.signTransaction(
      transaction,
      serializeConfig
    );
    const tx = web3.Transaction.from(signedTransaction.rawTransaction);
    const signature = await connection.sendRawTransaction(tx.serialize());
    return signature;
  };

  const signAllTransactions = async (transactions: web3.Transaction[]) => {
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
    new web3.PublicKey(MONO_DEVNET),
    provider
  );
  return { coinflowWallet, provider, program };
};

const Buttons = () => {
  const [coinflowWallet, setCoinflowWallet] = useState(null);

  const [anchor, setAnchor] = useState<AnchorProvider | null>(null);
  const [program, setProgram] = useState<Program<MonoProgram> | null>(null);
  const [tx, setTX] = useState(null);
  const connection = useMemo(() => new web3.Connection(rpcUrl), []);
  const magic = useMemo(
    () =>
      new Magic("pk_live_09B38A312623C6B7", {
        extensions: [
          new OAuthExtension(),
          new SolanaExtension({
            rpcUrl: rpcUrl,
          }),
        ],
      }),
    []
  );

  useEffect(() => {
    const setWallet = async () => {
      const { coinflowWallet, program, provider } = await getCoinflowWallet(
        magic,
        connection
      );
      setCoinflowWallet(coinflowWallet);
      setProgram(program);
      setAnchor(provider);
    };
    setTimeout(() => {
      setWallet();
    }, 1000);
  }, [magic]);

  useEffect(() => {
    if (coinflowWallet && !tx && false) {
      const getTX = async () => {
        const metadata = await magic.user.getMetadata();

        const payer = new web3.PublicKey(metadata.publicAddress);

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const txInfo = {
          /** The transaction fee payer */
          feePayer: payer,
          /** A recent blockhash */
          blockhash: blockhash,
          /** the last block chain can advance to before tx is exportd expired */
          lastValidBlockHeight: lastValidBlockHeight,
        };
        const devnetPK = new web3.PublicKey(DEVNET_USDC_MINT);

        const usdcMint = token.getMint(connection, devnetPK);
        const source = token.getAssociatedTokenAddressSync(devnetPK, payer);

        const recipientPubKey = new web3.PublicKey(
          new web3.PublicKey("FwqmdrxLKN9Gct9Dwp15wip5fNeSixJZ941bcnTKbAMo")
        );
        const destination = token.getAssociatedTokenAddressSync(
          devnetPK,
          recipientPubKey
        );
        const decimals = (await usdcMint).decimals;

        const ix = token.createTransferCheckedInstruction(
          source,
          new web3.PublicKey(DEVNET_USDC_MINT),
          destination,
          payer,
          1 * Math.pow(10, decimals),
          decimals
        );
        const tx = new web3.Transaction(txInfo).add(ix);
        debugger;
        setTX(tx);
        // console.log("hi");
        // const serializeConfig = {
        //   requireAllSignatures: false,
        //   verifySignatures: true,
        // };
        // const signedTransaction = await magic.solana.signTransaction(
        //   tx,
        //   serializeConfig
        // );

        // const stx = web3.Transaction.from(signedTransaction.rawTransaction);
        // debugger;
        // setTX(stx);
        // const serializeConfig = {
        //   requireAllSignatures: true,
        //   verifySignatures: true,
        // };

        // const signedTransaction = await magic.solana.signTransaction(
        //   rawtx,
        //   serializeConfig
        // );
        // const tx = web3.Transaction.from(signedTransaction.rawTransaction);
        // const signature = await connection.sendRawTransaction(tx.serialize());
        // console.log(signature);
      };
      getTX();
    }
  }, [coinflowWallet?.publicKey?.toString()]);

  return (
    <>
      <button
        onClick={async () => {
          const signature = createFFA(
            coinflowWallet.publicKey,
            coinflowWallet,
            anchor,
            program
          );
          console.log("created ", signature);
        }}
      >
        Create Escrow
      </button>
    </>
  );
};

export default function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    ready && (
      <>
        <Head>
          <title>Lancer</title>
          <meta name="description" content="Lancer Github Extension" />
        </Head>
        <main>
          <Buttons />
        </main>
      </>
    )
  );
}

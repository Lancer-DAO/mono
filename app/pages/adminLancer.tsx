import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import React, { useCallback, useMemo } from "react";
import styles from "../styles/Home.module.css";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import {
  createLancerTokenAccountInstruction,
  withdrawTokensInstruction,
} from "@/escrow/sdk/instructions";
import {
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  useConnection,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  UnsafeBurnerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import type { AppProps } from "next/app";
import type { FC } from "react";
import { createFeatureFundingAccountInstruction } from "@/escrow/sdk/instructions";
import {
  USDC_MINT,
  MAINNET_RPC,
  MAINNET_USDC_MINT,
  MONO_ADDRESS,
  IS_MAINNET,
} from "@/src/constants";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();
import { getAssociatedTokenAddress } from "@solana/spl-token";
const WalletDisconnectButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletDisconnectButton,
  { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const SendSOLToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, signAllTransactions, signTransaction } =
    useWallet();

  const createFeesAccount = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const provider = new AnchorProvider(
      connection,
      { ...wallet, signAllTransactions, signTransaction, publicKey },
      {}
    );
    const program = new Program<MonoProgram>(
      MonoProgramJSON as unknown as MonoProgram,
      new PublicKey(MONO_ADDRESS),
      provider
    );
    const create_lancer_token_account_ix =
      await createLancerTokenAccountInstruction(
        new PublicKey(USDC_MINT),
        program
      );
    await provider.sendAndConfirm(
      new Transaction().add(create_lancer_token_account_ix),
      []
    );
  }, [publicKey, connection]);

  const withdrawTokens = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const provider = new AnchorProvider(
      connection,
      { ...wallet, signAllTransactions, signTransaction, publicKey },
      {}
    );
    const program = new Program<MonoProgram>(
      MonoProgramJSON as unknown as MonoProgram,
      new PublicKey(MONO_ADDRESS),
      provider
    );
    const withdrawer = new PublicKey(
      "BuxU7uwwkoobF8p4Py7nRoTgxWRJfni8fc4U3YKGEXKs"
    );
    const withdrawerTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(USDC_MINT),
      withdrawer
    );
    const create_lancer_token_account_ix = await withdrawTokensInstruction(
      1,
      new PublicKey(USDC_MINT),
      withdrawer,
      withdrawerTokenAccount,
      program
    );
    await provider.sendAndConfirm(
      new Transaction().add(create_lancer_token_account_ix),
      []
    );
  }, [publicKey, connection]);

  return (
    connection && (
      <>
        <div className={styles.walletButtons}>
          <WalletMultiButtonDynamic />
          <WalletDisconnectButtonDynamic />
        </div>

        <button onClick={createFeesAccount} disabled={!publicKey}>
          Create New Mint Fees Account
        </button>

        <button onClick={withdrawTokens} disabled={!publicKey}>
          Withdraw Tokens
        </button>
      </>
    )
  );
};

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <SendSOLToRandomAddress />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

const App: FC<AppProps> = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const endpoint = useMemo(
    () =>
      IS_MAINNET ? MAINNET_RPC : clusterApiUrl(WalletAdapterNetwork.Devnet),
    [IS_MAINNET]
  );
  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/solana-labs/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint]
  );

  return (
    wallets && (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Home />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    )
  );
};

export default App;

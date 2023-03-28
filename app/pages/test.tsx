import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import axios from "axios";
import {
  DEVNET_USDC_MINT,
  USER_REPOSITORIES_ROUTE,
  USER_REPOSITORY_ISSUES_ROUTE,
} from "@/src/constants";
import { Octokit } from "octokit";
const rpcUrl = web3.clusterApiUrl("devnet");

import { SolanaExtension } from "@magic-ext/solana";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import Coinflow from "@/src/pages/bounty/components/coinflowPurchase";
const getCoinflowWallet = async (magic, connection) => {
  const metadata = await magic.user.getMetadata();
  debugger;

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
  const coinflowWallet: SolanaWalletContextState = {
    wallet: null,
    connected: true,
    publicKey: payer,
    sendTransaction,
    signMessage,
    signTransaction,
  };
  debugger;
  return coinflowWallet;
};

const Buttons = () => {
  const [coinflowWallet, setCoinflowWallet] = useState(null);
  const [tx, setTX] = useState(null);
  const connection = useMemo(() => new web3.Connection(rpcUrl), []);

  const magic = useMemo(
    () =>
      new Magic("pk_live_736C8D5728FF026E", {
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
    // debugger;
    if (magic.user.isLoggedIn()) {
      const setWallet = async () => {
        const wallet = await getCoinflowWallet(magic, connection);
        // debugger;
        setCoinflowWallet(wallet);
      };
      setWallet();
    }
  }, [magic, connection]);

  useEffect(() => {
    // debugger;
    if (coinflowWallet && !tx) {
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
          await magic.oauth.loginWithRedirect({
            provider: "github" /* 'google', 'facebook', 'apple', or 'github' */,
            redirectURI: "http://localhost:3000/test",
          });
        }}
      >
        Login
      </button>

      <button
        onClick={async () => {
          const result = await magic.oauth.getRedirectResult();
          debugger;
        }}
      >
        Get Result
      </button>

      <button
        onClick={async () => {
          const result = await magic.oauth.getRedirectResult();

          const authToken = result.oauth.accessToken;
          const userId = result.oauth.userHandle;
          const octokit = new Octokit({
            auth: authToken,
          });
          const octokitResponse = await octokit.request("GET /user");
          //   const resp = await axios.post(`${USER_REPOSITORY_ISSUES_ROUTE}`, {
          //     authToken,
          //     githubId: `github|${userId}`,
          //   });
          console.log(octokitResponse);
          debugger;
        }}
      >
        Test Token
      </button>
      {tx !== null && (
        <Coinflow
          wallet={coinflowWallet}
          connection={connection}
          transaction={tx}
          onSuccess={() => {}}
          amount={1}
        />
      )}
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

import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { PubKey } from "@/src/components";
import Coinflow from "./coinflowOfframp";
import { PageLayout } from "@/src/layouts";
import { WalletInfo } from "@/src/pages/account/components/WalletInfo";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";
import classnames from "classnames";

const FundBounty: React.FC = () => {
  const { currentUser, wallets } = useLancer();
  const [apiKey, setApiKey] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeys, setApiKeys] = useState({});
  const [showCoinflow, setShowCoinflow] = useState(false);
  useEffect(() => {
    const apiKeys = JSON.parse(localStorage.getItem("apiKeys") || "{}");
    setApiKeys(apiKeys);
  }, []);

  return (
    currentUser && (
      <PageLayout>
        <div className="account-page-wrapper">
          {currentUser?.githubLogin && (
            <div>GitHub User: {currentUser.githubLogin}</div>
          )}
          <a href="/api/auth/logout">Logout</a>

          {wallets &&
            wallets.map((wallet) => (
              <WalletInfo wallet={wallet} key={wallet.publicKey.toString()} />
            ))}

          {!IS_MAINNET && (
            <a
              href="https://staging.coinflow.cash/faucet"
              target={"_blank"}
              rel="noreferrer"
            >
              USDC Faucet
            </a>
          )}
          <button
            onClick={() => {
              setShowCoinflow(!showCoinflow);
            }}
          >
            Cash Out
          </button>
          {showCoinflow && <Coinflow />}
        </div>
      </PageLayout>
    )
  );
};

export default FundBounty;

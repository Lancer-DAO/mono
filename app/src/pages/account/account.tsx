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

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
const FundBounty: React.FC = () => {
  const { currentUser, wallets } = useLancer();
  const [apiKey, setApiKey] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeys, setApiKeys] = useState({});
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

          <div className={styles.walletButtons}>
            <WalletMultiButtonDynamic />
          </div>
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
          <div>
            {Object.entries(apiKeys).map(([key, value]) => (
              <div>{`${key}: ${value}`}</div>
            ))}
          </div>
          <div>
            <input
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
              }}
            />
            <input
              type="text"
              placeholder="API Key Name"
              value={apiKeyName}
              onChange={(e) => {
                setApiKeyName(e.target.value);
              }}
            />
            <button
              className={classnames({
                disabled: apiKey === "" || apiKeyName === "",
              })}
              onClick={() => {
                apiKeys[apiKeyName] = apiKey;
                localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
              }}
            >
              Save API Key to Local Storage
            </button>
          </div>
          <Coinflow />
        </div>
      </PageLayout>
    )
  );
};

export default FundBounty;

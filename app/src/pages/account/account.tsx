import { DEVNET_USDC_MINT } from "@/src/constants";
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

const FundBounty: React.FC = () => {
  const { currentUser, wallets } = useLancer();

  return (
    currentUser && (
      <PageLayout>
        <div className="account-page-wrapper">
          {currentUser?.githubLogin && (
            <div>GitHub User: {currentUser.githubLogin}</div>
          )}
          {wallets.map((wallet) => (
            <WalletInfo wallet={wallet} key={wallet.publicKey.toString()} />
          ))}

          <a
            href="https://staging.coinflow.cash/faucet"
            target={"_blank"}
            rel="noreferrer"
          >
            USDC Faucet
          </a>
          <Coinflow />
        </div>
      </PageLayout>
    )
  );
};

export default FundBounty;

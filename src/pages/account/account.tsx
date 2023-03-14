import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { fundFFA } from "@/src/onChain";
import { getApiEndpoint, getSolscanTX } from "@/src/utils";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState } from "@/src/types";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  createMint,
  mintToChecked,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  createSyncNativeInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { PubKey } from "@/src/components";
import {
  CoinflowPurchase,
  SolanaWalletContextState,
} from "@coinflowlabs/react";
import { WalletContextState } from "@solana/wallet-adapter-react";
import Coinflow from "./coinflowOfframp";
import { PageLayout } from "@/src/layouts";

const FundBounty: React.FC = () => {
  const { wallet, anchor, program, setIssue, issue, user, coinflowWallet } =
    useLancer();
  const [userSOLBalance, setUserSOLBalance] = useState("0.0");
  const [userUSDCBalance, setUserUSDCBalance] = useState("0.0");
  const [aidropSignature, setAirdropSignature] = useState("");

  useEffect(() => {
    const getWalletUSDCBalance = async () => {
      const mintKey = new PublicKey(DEVNET_USDC_MINT);
      const token_account = await getAssociatedTokenAddress(
        mintKey,
        user.publicKey
      );
      const account = await getAccount(anchor.connection, token_account);
      const mint = await getMint(anchor.connection, mintKey);
      const decimals = Math.pow(10, mint.decimals);
      console.log(account.amount);
      const balance = account.amount / BigInt(decimals);
      setUserUSDCBalance(balance.toString());
    };
    if (user?.publicKey && anchor?.connection) {
      getWalletUSDCBalance();
    }
  }, [user?.publicKey, anchor]);

  useEffect(() => {
    const getWalletSOLBalance = async () => {
      const totalBalance = await anchor.connection.getBalance(user.publicKey);
      const balance = totalBalance / 1000000000;
      setUserSOLBalance(balance.toString());
    };
    if (user?.publicKey && anchor?.connection) {
      getWalletSOLBalance();
    }
  }, [user?.publicKey, anchor]);

  const requestAirdrop = async () => {
    console.log("requesting airdrop");
    const airdrop = await anchor.connection.requestAirdrop(
      wallet.publicKey,
      1000000000
    );
    console.log("airdrop signature", airdrop);
    setAirdropSignature(airdrop);
  };
  return (
    user &&
    anchor && (
      <PageLayout>
        <div className="account-page-wrapper">
          <PubKey pubKey={user.publicKey} full />
          <div className="User Balance">User SOL Balance: {userSOLBalance}</div>
          <button className="button-primary" onClick={() => requestAirdrop()}>
            Request SOL Airdrop
          </button>
          {aidropSignature !== "" && (
            <a
              href={getSolscanTX(aidropSignature)}
              target={"_blank"}
              rel="noreferrer"
            >
              Airdrop: {aidropSignature}
            </a>
          )}
          <div className="User Balance">
            User USDC Balance: {userUSDCBalance}
          </div>
          <a
            href="https://staging.coinflow.cash/faucet"
            target={"_blank"}
            rel="noreferrer"
          >
            USDC Faucet
          </a>
        </div>
      </PageLayout>
    )
  );
};

export default FundBounty;

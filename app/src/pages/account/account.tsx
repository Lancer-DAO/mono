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

const FundBounty: React.FC = () => {
  const { wallet, provider, currentUser } = useLancer();
  const [currentUserSOLBalance, setUserSOLBalance] = useState("0.0");
  const [currentUserUSDCBalance, setUserUSDCBalance] = useState("0.0");
  const [aidropSignature, setAirdropSignature] = useState("");
  console.log(provider, currentUser);

  useEffect(() => {
    const getWalletUSDCBalance = async () => {
      try {
        const mintKey = new PublicKey(DEVNET_USDC_MINT);
        const token_account = await getAssociatedTokenAddress(
          mintKey,
          new PublicKey(currentUser.currentWallet.publicKey)
        );
        const account = await getAccount(provider.connection, token_account);
        const mint = await getMint(provider.connection, mintKey);
        const decimals = Math.pow(10, mint.decimals);
        console.log(account.amount);
        const balance = account.amount / BigInt(decimals);
        setUserUSDCBalance(balance.toString());
      } catch (e) {
        console.log(e);
        setUserUSDCBalance("Account Not Initialized. Please Use the Faucet");
      }
    };

    if (currentUser?.currentWallet?.publicKey && provider?.connection) {
      getWalletUSDCBalance();
    }
  }, [currentUser?.currentWallet?.publicKey, provider]);

  useEffect(() => {
    const getWalletSOLBalance = async () => {
      const totalBalance = await provider.connection.getBalance(
        new PublicKey(currentUser.currentWallet.publicKey)
      );
      const balance = totalBalance / 1000000000;
      setUserSOLBalance(balance.toString());
    };
    if (currentUser?.currentWallet?.publicKey && provider?.connection) {
      getWalletSOLBalance();
    }
  }, [currentUser?.currentWallet?.publicKey, provider]);

  const requestAirdrop = async () => {
    console.log("requesting airdrop");
    const airdrop = await provider.connection.requestAirdrop(
      wallet.publicKey,
      1000000000
    );
    console.log("airdrop signature", airdrop);
    setAirdropSignature(airdrop);
  };
  return (
    currentUser &&
    provider && (
      <PageLayout>
        <div className="account-page-wrapper">
          {currentUser?.githubLogin && (
            <div>GitHub User: {currentUser.githubLogin}</div>
          )}
          <PubKey
            pubKey={new PublicKey(currentUser.currentWallet.publicKey)}
            full
          />
          <div className="User Balance">
            User SOL Balance: {currentUserSOLBalance}
          </div>
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
            User USDC Balance: {currentUserUSDCBalance}
          </div>
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

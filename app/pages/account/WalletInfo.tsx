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
import { DefaultLayout } from "@/src/components/templates/DefaultLayout";
import { LancerWallet } from "@/src/types";

export const WalletInfo: React.FC<{ wallet: LancerWallet }> = ({ wallet }) => {
  const { provider, setCurrentWallet, currentWallet } = useLancer();
  const [currentUserSOLBalance, setUserSOLBalance] = useState("0.0");
  const [currentUserUSDCBalance, setUserUSDCBalance] = useState("0.0");
  const [aidropSignature, setAirdropSignature] = useState("");

  useEffect(() => {
    const getWalletUSDCBalance = async () => {
      try {
        const mintKey = new PublicKey(USDC_MINT);
        const token_account = await getAssociatedTokenAddress(
          mintKey,
          new PublicKey(wallet.publicKey)
        );
        const account = await getAccount(provider.connection, token_account);
        const mint = await getMint(provider.connection, mintKey);
        const decimals = Math.pow(10, mint.decimals);
        const balance = account.amount / BigInt(decimals);
        setUserUSDCBalance(balance.toString());
      } catch (e) {
        console.error(e);
        setUserUSDCBalance("Account Not Initialized. Please Use the Faucet");
      }
    };

    if (provider?.connection) {
      getWalletUSDCBalance();
    }
  }, [provider]);

  useEffect(() => {
    const getWalletSOLBalance = async () => {
      const totalBalance = await provider.connection.getBalance(
        new PublicKey(wallet.publicKey)
      );
      const balance = totalBalance / 1000000000;
      setUserSOLBalance(balance.toString());
    };
    if (wallet.publicKey && provider?.connection) {
      getWalletSOLBalance();
    }
  }, [provider]);

  const requestAirdrop = async () => {
    const airdrop = await provider.connection.requestAirdrop(
      wallet.publicKey,
      1000000000
    );
    setAirdropSignature(airdrop);
  };
  return (
    provider && (
      <div className="account-page-wrapper">
        <PubKey pubKey={new PublicKey(wallet.publicKey)} full />
        {wallet.publicKey.toString() === currentWallet?.publicKey.toString() ? (
          <div>Current Wallet</div>
        ) : (
          <button
            className="button-primary"
            onClick={() => setCurrentWallet(wallet)}
          >
            Set as Current Wallet
          </button>
        )}
        <div className="User Balance">SOL Balance: {currentUserSOLBalance}</div>
        {!IS_MAINNET && (
          <button className="button-primary" onClick={() => requestAirdrop()}>
            Request SOL Airdrop
          </button>
        )}
        {aidropSignature !== "" && (
          <a
            href={getSolscanTX(aidropSignature)}
            target={"_blank"}
            rel="noreferrer"
          >
            Airdrop SOL: {aidropSignature}
          </a>
        )}
        <div className="User Balance">
          USDC Balance: {currentUserUSDCBalance}
        </div>
      </div>
    )
  );
};

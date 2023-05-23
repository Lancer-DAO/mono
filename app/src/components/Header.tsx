import Link from "next/link";
import Logo from "../assets/Logo";
import { PubKey } from "@/src/components/PublicKey";
import { useLancer } from "@/src/providers";
import { getWalletProviderImage } from "@/src/utils";
import { useState } from "react";
import dynamic from "next/dynamic";

import styles from "@/styles/Home.module.css";
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
export const Header = () => {
  const { currentWallet, wallets, setCurrentWallet } = useLancer();
  const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);
  const toggleWalletSelectOpen = () =>
    setIsWalletSelectOpen(!isWalletSelectOpen);

  return (
    <div
      data-collapse="medium"
      data-animation="default"
      data-duration="400"
      data-w-id="58db7844-5919-d71b-dd74-2323ed8dffe9"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="header w-nav"
    >
      <div className="container-default container-header w-container">
        <Link href="/" className="brand w-nav-brand">
          <Logo width="auto" height="90px" />
        </Link>
        <div className="header-right">
          <Link href={`/create`} className="button-primary">
            New Bounty
          </Link>
          <Link href={`/my_bounties`} className="button-primary">
            My bounties
          </Link>
          <Link href={`/bounties`} className="button-primary">
            All bounties
          </Link>

          <Link href={`/account`} className="button-primary">
            Account
          </Link>

          <div className={styles.walletButtons}>
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </div>
    </div>
  );
};

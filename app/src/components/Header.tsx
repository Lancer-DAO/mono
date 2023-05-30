import Link from "next/link";
import Logo from "../assets/Logo";
import { PubKey } from "@/src/components/PublicKey";
import { useLancer } from "@/src/providers";
import { getWalletProviderImage } from "@/src/utils";
import { useState } from "react";
import dynamic from "next/dynamic";

import styles from "@/styles/Home.module.css";

const HEADER_LINKS:HeaderButtonProps[] = [{href:"/create", text: "New Bounty"}, {href: "/my_bounties", text:"My Bounties"}, {href: "/bounties", text:"All Bounties"}, {href: "/account", text:"Bounty"}]

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

interface HeaderButtonProps {
  href: string;
  text: string;
}

const HeaderButton = ({href, text}: HeaderButtonProps) => {
return <Link href={href} className="py-4 px-6 rounded-md bg-turquoise-500 shadow-md transition duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 text-white-100 text-base font-bold text-center uppercase">

{text}
</Link>
}
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
          {HEADER_LINKS.map(({href, text}) => {
            return <HeaderButton href={href} text={text} />
          })}

          <div className={styles.walletButtons}>
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </div>
    </div>
  );
};

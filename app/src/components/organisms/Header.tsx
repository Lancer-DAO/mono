import Link from "next/link";
import Logo from "../../assets/Logo";
import { useLancer } from "@/src/providers";
import { getWalletProviderImage } from "@/src/utils";
import { useState } from "react";

import styles from "@/styles/Home.module.css";
import { LinkButton, AccountHeaderOptions } from "@/src/components/";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";
import dynamic from "next/dynamic";
const HEADER_LINKS: LinkButtonProps[] = [
  { href: "/create", children: "New Bounty" },
  { href: "/bounties", children: "Bounties" },
];

interface HeaderButtonProps {
  href: string;
  text: string;
}
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
export const Header = () => {
  const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);

  return (
    <div className="flex sticky py-[20px] bg-white-100 top-0">
      <div className="flex items-center mx-auto w-[70%]">
        <Link
          href="/"
          className="relative float-left text-blue-500 transition-colors duration-400 ease-in-out hover:text-blue-600 no-underline"
        >
          <Logo width="auto" height="50px" />
        </Link>
        <div className="ml-[20px] flex gap-[10px] items-center w-full">
          {HEADER_LINKS.map(({ href, children }) => {
            return <LinkButton href={href} children={children} style="text" />;
          })}
          <div className="ml-auto">
            <WalletMultiButtonDynamic className="text-gray-800 flex h-[48px] w-[250px] py-[6px] items-center justify-center border-solid hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out" />
          </div>

          <AccountHeaderOptions />
        </div>
      </div>
    </div>
  );
};

export default Header;

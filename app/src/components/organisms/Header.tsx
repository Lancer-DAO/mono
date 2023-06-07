import Link from "next/link";
import Logo from "../../assets/Logo";
import { useLancer } from "@/src/providers";
import { getWalletProviderImage } from "@/src/utils";
import { useState } from "react";

import styles from "@/styles/Home.module.css";
import { LinkButton, ApiKeyModal } from "@/src/components/";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";
import AccountHeaderOptions from "../molecules/AccountHeaderOptions";
const HEADER_LINKS: LinkButtonProps[] = [
  { href: "/create", children: "New Bounty" },
  { href: "/bounties", children: "Bounties" },
];

interface HeaderButtonProps {
  href: string;
  text: string;
}

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

          <AccountHeaderOptions />
        </div>
      </div>
    </div>
  );
};

export default Header;

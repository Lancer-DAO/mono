import Link from "next/link";
import Logo from "../../assets/Logo";
import { PubKey } from "@/src/components/atoms/PubKey";
import { useLancer } from "@/src/providers";
import { getWalletProviderImage } from "@/src/utils";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Key } from "react-feather";

import styles from "@/styles/Home.module.css";
import { LinkButton, ApiKeyModal } from "@/src/components/";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";
const HEADER_LINKS: LinkButtonProps[] = [
  { href: "/create", text: "New Bounty" },
  { href: "/my_bounties", text: "My Bounties" },
  { href: "/bounties", text: "All Bounties" },
  { href: "/account", text: "Account" },
];

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

interface HeaderButtonProps {
  href: string;
  text: string;
}

const HeaderButton = ({ href, text }: HeaderButtonProps) => {
  return (
    <Link
      href={href}
      className="flex items-center  button-primary p-[18px 24px] rounded-[4px] bg-turquoise-500 shadow-[0 2px 6px 0 rgba(5, 21, 46, 0.12), 0 14px 14px 0 rgba(21, 60, 245, 0.2)] transition-shadow transition-bg-color transition-transform duration-[300ms] ease-in-out text-white text-[16px] font-bold text-center tracking-wider uppercase hover:bg-aqua-500 hover:shadow-[0 3px 9px 0 rgba(5, 21, 46, 0.16), 0 14px 19px 0 rgba(21, 60, 245, 0.23)] hover:-webkit-transform translate-[0px -2px] hover:-ms-transform translate-[0px -2px] hover:transform translate-[0px -2px] hover:text-white disabled:bg-gray-500 disabled:pointer-events-none"
    >
      {text}
    </Link>
  );
};
export const Header = () => {
  const { currentAPIKey } = useLancer();
  const [showModal, setShowModal] = useState(false);

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
      <div className="flex items-center mx-auto w-[70%]">
        <Link
          href="/"
          className="relative float-left text-blue-500 transition-colors duration-400 ease-in-out hover:text-blue-600 no-underline"
        >
          <Logo width="auto" height="90px" />
        </Link>
        <div className="ml-auto flex gap-[10px]">
          {HEADER_LINKS.map(({ href, text }) => {
            return <LinkButton href={href} text={text} />;
          })}

          <WalletMultiButtonDynamic />
          <button
            onClick={() => setShowModal(true)}
            className="gap-[6px] flex items-center button-primary p-[18px 24px] rounded-[4px] bg-turquoise-500 shadow-[0 2px 6px 0 rgba(5, 21, 46, 0.12), 0 14px 14px 0 rgba(21, 60, 245, 0.2)] transition-shadow transition-bg-color transition-transform duration-[300ms] ease-in-out text-white text-[16px] font-bold text-center tracking-wider uppercase hover:bg-aqua-500 hover:shadow-[0 3px 9px 0 rgba(5, 21, 46, 0.16), 0 14px 19px 0 rgba(21, 60, 245, 0.23)] hover:-webkit-transform translate-[0px -2px] hover:-ms-transform translate-[0px -2px] hover:transform translate-[0px -2px] hover:text-white disabled:bg-gray-500 disabled:pointer-events-none"
          >
            {currentAPIKey ? currentAPIKey.name : "Set API Key"} <Key />
          </button>
          <ApiKeyModal showModal={showModal} setShowModal={setShowModal} />
        </div>
      </div>
    </div>
  );
};

export default Header;

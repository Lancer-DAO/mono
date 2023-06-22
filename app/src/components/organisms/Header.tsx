import Link from "next/link";
import Logo from "../../assets/Logo";
import { LinkButton, AccountHeaderOptions } from "@/src/components/";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";
import dynamic from "next/dynamic";
import { HelpCircle } from "react-feather";
import { useLancer } from "@/src/providers";
import { useState } from "react";
import {
  BOUNTIES_PAGE_STEPS,
  BOUNTY_METADATA_STEPS,
  CREATE_BOUNTY_STEPS,
} from "./JoyrideWrapper";
const HEADER_LINKS: LinkButtonProps[] = [
  { href: "/create", children: "New Bounty", id: "create-bounty-link" },
  { href: "/bounties", children: "Bounties", id: "bounties-link" },
];

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
export const Header = () => {
  const {
    setIsTutorialRunning,
    setCurrentTutorialStep,
    setIsTutorialActive,
    setTutorialSteps,
    setIsTutorialManuallyControlled,
    setSpotlightClicks,
  } = useLancer();
  const [isTutorialButtonHovered, setIsTutorialButtonHovered] = useState(false);
  return (
    <div className="flex sticky py-[20px] bg-white-100 top-0 z-20">
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
          <div className="ml-auto" id="wallet-connect-button">
            <WalletMultiButtonDynamic className="text-gray-800 flex h-[48px] w-[250px] py-[6px] items-center justify-center border-solid hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out" />
          </div>

          <AccountHeaderOptions />
          <button
            onClick={() => {
              setIsTutorialRunning(true);
              setCurrentTutorialStep(0);
              setIsTutorialManuallyControlled(false);
              setIsTutorialActive(true);
              setTutorialSteps(BOUNTIES_PAGE_STEPS);
              setSpotlightClicks(false);
            }}
            onMouseEnter={() => setIsTutorialButtonHovered(true)}
            onMouseLeave={() => setIsTutorialButtonHovered(false)}
            id="start-tutorial-link"
            className="flex rounded-full h-[48px] w-[48px] gap-[10px] py-[6px] items-center justify-center hover:bg-turquoise-500 "
          >
            <HelpCircle
              height={48}
              width={48}
              strokeWidth={1.25}
              color={isTutorialButtonHovered ? "#fff" : "#14bb88"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

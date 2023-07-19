import Link from "next/link";
import Logo from "../../assets/Logo";
import {
  LinkButton,
  AccountHeaderOptions,
  TutorialsModal,
} from "@/src/components/";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";
import dynamic from "next/dynamic";
import { HelpCircle } from "react-feather";
import { useUserWallet } from "@/src/providers";
import { useState } from "react";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useAppContext } from "@/src/providers/appContextProvider";
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
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { isRouterReady } = useAppContext();
  const [isTutorialButtonHovered, setIsTutorialButtonHovered] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
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
            return (
              <LinkButton href={href} children={children} version="text" />
            );
          })}
          <div
            className="ml-auto"
            id="wallet-connect-button"
            onClick={() => {
              if (
                !!currentTutorialState &&
                currentTutorialState?.title ===
                  PROFILE_TUTORIAL_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 1
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  isRunning: false,
                });
                return;
              }
            }}
          >
            <WalletMultiButtonDynamic className="text-gray-800 flex h-[48px] w-[250px] py-[6px] items-center justify-center border-solid hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out" />
          </div>

          <AccountHeaderOptions />
          <button
            onClick={() => {
              setShowTutorialModal(true);
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
          {isRouterReady && (
            <TutorialsModal
              setShowModal={setShowTutorialModal}
              showModal={showTutorialModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

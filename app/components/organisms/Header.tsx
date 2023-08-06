import Link from "next/link";
import { AccountHeaderOptions, TutorialsModal } from "@/components";
import Logo from "../@icons/Logo";
import dynamic from "next/dynamic";
import { HelpCircle } from "react-feather";
import { useState } from "react";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useAppContext } from "@/src/providers/appContextProvider";
import { IS_CUSTODIAL } from "@/src/constants";

const HEADER_LINKS = [
  { href: "/create", children: "New Quest", id: "create-bounty-link" },
  { href: "/bounties", children: "Quests", id: "bounties-link" },
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
    <div className="sticky py-4 top-0 z-20">
      <div className="flex items-center gap-8 mx-auto w-[90%]">
        <Link href="/" className="flex items-center gap-1">
          <Logo width="auto" height="34.25px" />
          <p className="text-lg text-bgLancerSecondary">Lancer</p>
        </Link>
        <div className="flex gap-8 items-center w-full">
          {HEADER_LINKS.map(({ href, children }) => {
            return (
              <a href={href} className="text-lg" key={href}>
                {children}
              </a>
            );
          })}
          {!IS_CUSTODIAL && (
            <div
              className="ml-auto pr-2"
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
              <WalletMultiButtonDynamic
                className="flex h-[48px] px-8 py-[6px] items-center justify-center 
                border-solid !bg-primaryBtn !border-primaryBtnBorder !border !text-textPrimary
                !rounded-md"
              />
            </div>
          )}

          <AccountHeaderOptions />
          <button
            onClick={() => {
              setShowTutorialModal(true);
            }}
            onMouseEnter={() => setIsTutorialButtonHovered(true)}
            onMouseLeave={() => setIsTutorialButtonHovered(false)}
            id="start-tutorial-link"
            className="flex rounded-full h-[48px] w-[48px] gap-[10px] py-[6px] 
            items-center justify-center hover:bg-turquoise-500"
          >
            <HelpCircle
              height={48}
              width={48}
              strokeWidth={1.25}
              color={isTutorialButtonHovered ? "#fff" : "#C5FFBA"}
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

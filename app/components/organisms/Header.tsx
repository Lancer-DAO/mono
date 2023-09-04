import Link from "next/link";
import { AccountHeaderOptions, TutorialsModal, LinkButton } from "@/components";
import Logo from "../@icons/Logo";
import { HelpCircle } from "react-feather";
import { useState } from "react";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useAppContext } from "@/src/providers/appContextProvider";
import { IS_CUSTODIAL } from "@/src/constants";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserWallet } from "@/src/providers";
import { useChat } from "@/src/providers/chatProvider";

const HEADER_LINKS = [
  {
    href: "/create",
    children: "New Quest",
    id: "create-bounty-link",
    disabledText: "You must be Approved to create a Quest.",
  },
  {
    href: "/quests",
    children: "Quests",
    id: "bounties-link",
    disabledText: "You must be Approved to view Quests.",
  },
  ,
  {
    href: "/leaderboard",
    children: "Leaderboards",
    id: "leaderboards-link",
  },
];

export const Header = () => {
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { isRouterReady } = useAppContext();
  const [isTutorialButtonHovered, setIsTutorialButtonHovered] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  const { currentUser } = useUserWallet();
  const { publicKey } = useWallet();
  const { currentWallet } = useUserWallet();

  return (
    <div className="py-4 top-0 z-20 bg-bgLancer">
      <div className="flex items-center gap-8 mx-auto w-[90%]">
        <Link href="/" className="flex items-center gap-0.5">
          <Logo width="auto" height="35px" />
          <p className="text-lg text-bgLancerSecondary">Lancer</p>
        </Link>
        <div className="flex gap-8 items-center w-full">
          {currentUser &&
            HEADER_LINKS.map(({ href, children, disabledText }, index) => {
              return (
                <LinkButton
                  href={href}
                  className="text-lg font-bold"
                  key={href}
                  disabled={index === 2 ? false : !currentUser.hasBeenApproved}
                  disabledText={disabledText}
                >
                  {children}
                </LinkButton>
              );
            })}
          <div className="flex items-center gap-8 ml-auto">
            {<AccountHeaderOptions />}

            {!IS_CUSTODIAL && (
              <div
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
                <WalletMultiButton
                  className="flex h-[48px] px-8 py-[6px] items-center justify-center
                !border-solid !bg-primaryBtn !border-primaryBtnBorder !border
                !text-textGreen !rounded-md !whitespace-nowrap !font-base"
                  startIcon={undefined}
                >
                  {currentWallet?.publicKey
                    ? currentWallet.publicKey.toBase58().slice(0, 4) +
                      " ... " +
                      currentWallet?.publicKey.toBase58().slice(-4)
                    : "Connect"}
                </WalletMultiButton>
              </div>
            )}
          </div>
          {/* <button
            onClick={() => {
              setShowTutorialModal(true);
            }}
            onMouseEnter={() => setIsTutorialButtonHovered(true)}
            onMouseLeave={() => setIsTutorialButtonHovered(false)}
            id="start-tutorial-link"
            className="flex rounded-full h-[48px] w-[48px] gap-[10px] py-[6px] 
            items-center justify-center"
          >
            <HelpCircle
              height={48}
              width={48}
              strokeWidth={1.25}
              color={isTutorialButtonHovered ? "#fff" : "#C5FFBA"}
            />
          </button> */}
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

import Link from "next/link";
import Logo from "../../assets/Logo";
import lgo from "../../../lgoo.png"
import styles from "../../../pages/account/style.module.css"
import {
  LinkButton,
  AccountHeaderOptions,
  TutorialsModal,
} from "@/src/components/";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";
import dynamic from "next/dynamic";
import { HelpCircle } from "react-feather";
import { useLancer } from "@/src/providers";
import { useState } from "react";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
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
    isRouterReady,
    currentTutorialState,
    setCurrentTutorialState,
    currentUser,
  } = useLancer();
  const [isTutorialButtonHovered, setIsTutorialButtonHovered] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  return (
    <div className={styles.nav}>
      <div className="flex items-center mx-auto w-[70%]">
        <Link
          href="/"
          className="relative float-left text-blue-500 transition-colors duration-400 ease-in-out hover:text-blue-600 no-underline"
        >
          <Logo width="auto" height="50px" />
        </Link>
        <div className="ml-[20px] flex gap-[10px] items-center w-full">
          
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

          </div>

          <AccountHeaderOptions />
         
        
        </div>
      </div>
    </div>
  );
};

export default Header;

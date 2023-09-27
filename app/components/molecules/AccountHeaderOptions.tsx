import { useRef, useState } from "react";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";
import { ApiKeyModal, Button, PubKey } from "@/components";
import { useOutsideAlerter } from "@/src/hooks/useOutsideAlerter";
import Link from "next/link";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE,
  GITHUB_API_KEY_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { IS_CUSTODIAL } from "@/src/constants";
import { useDebugMode } from "@/src/providers/debugModeProvider";
import classNames from "classnames";

const AccountHeaderOptions = () => {
  const { currentUser, logout, currentWallet } = useUserWallet();
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();

  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowOptions(false);
  });

  if (!currentUser) return null;

  return (
    <div className="relative">
      <div
        className="cursor-pointer"
        onClick={() => {
          setShowOptions(true);
          if (!!currentTutorialState && currentTutorialState.isActive) {
            if (
              currentTutorialState?.title ===
                GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
              currentTutorialState.currentStep === 0
            ) {
              setCurrentTutorialState({
                ...currentTutorialState,
                currentStep: 1,
              });
            } else if (
              currentTutorialState?.title ===
                BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title &&
              currentTutorialState.currentStep === 7
            ) {
              setCurrentTutorialState({
                ...currentTutorialState,
                currentStep: 8,
              });
            } else if (
              currentTutorialState?.title ===
                BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
              currentTutorialState.currentStep === 6
            ) {
              setCurrentTutorialState({
                ...currentTutorialState,
                currentStep: 7,
              });
            }
          }
        }}
        id="account-options"
      >
        <Image
          src={
            currentUser.picture
              ? currentUser.picture
              : `https://avatars.githubusercontent.com/u/${
                  currentUser.githubId?.split("|")[1]
                }?s=60&v=4`
          }
          width={32}
          height={32}
          className="rounded-full"
          alt="user profile picture"
        />
      </div>
      {showOptions && (
        <div
          className={`z-50 absolute items-center justify-center 
          ${IS_CUSTODIAL ? "left-[-120px]" : "left-[-105px]"} 
          top-[50px] bg-white w-[220px] rounded-[20px] shadow-md`}
          ref={wrapperRef}
        >
          <Link
            href={"/account"}
            id="account-link"
            onClick={() => {
              if (!!currentTutorialState && currentTutorialState.isActive) {
                if (
                  currentTutorialState?.title ===
                    BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 7
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    currentStep: 8,
                    isRunning: false,
                  });
                }
              }
            }}
            className="flex rounded-t-[20px] h-[48px] py-[6px] items-center justify-center 
            border-b-gray-400 border-b-[1px] hover:bg-bgLancer text-gray-800 
            transition-colors duration-300 ease-in-out"
          >
            Account
          </Link>

          <Link
            href={"https://discord.gg/gqSpskjvxy"}
            target="_blank"
            id="discord-link"
            className="flex h-[48px] border-b-gray-400 border-b-[1px] py-[6px] items-center justify-center
            hover:bg-bgLancer text-gray-800 transition-colors duration-300 ease-in-out"
          >
            Discord
          </Link>
          <Link
            href={
              "https://lancerworks.notion.site/Lancer-Documentation-ed924cd3b28e44e3bf90fb5db1dc46d3?pvs=4"
            }
            id="documentation-link"
            target="_blank"
            className="flex h-[48px] border-b-gray-400 border-b-[1px] py-[6px] items-center justify-center
            hover:bg-bgLancer text-gray-800 transition-colors duration-300 ease-in-out"
          >
            Documentation
          </Link>

          {!IS_CUSTODIAL && (
            <Link
              href={"/api/auth/logout"}
              id="logout-link"
              className="flex h-[48px] rounded-b-[20px] py-[6px] items-center justify-center
              hover:bg-bgLancer text-gray-800 transition-colors duration-300 ease-in-out"
            >
              Logout
            </Link>
          )}
          {IS_CUSTODIAL && (
            <>
              <Button
                onClick={logout}
                id="logout-link"
                className="flex w-full h-[48px] border-b-gray-400 border-b-[1px] py-[6px] items-center justify-center
                hover:bg-bgLancer text-gray-800 transition-colors duration-300 ease-in-out"
              >
                Logout
              </Button>
              <PubKey pubKey={currentWallet.publicKey} />
            </>
          )}

          <Button
            className={classNames(
              "flex w-full h-[48px] border-t-gray-400 rounded-b-[20px] hover:bg-bgLancer border-t-[1px] py-[6px] items-center justify-center transition-colors duration-300 ease-in-out",
              isDebugMode
                ? "text-white bg-bgLancerSecondary"
                : "hover:bg-turquoise-500 text-gray-800 "
            )}
            onClick={() => setIsDebugMode(!isDebugMode)}
          >{`Debug ${isDebugMode ? "On" : "Off"}`}</Button>
        </div>
      )}
      <ApiKeyModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
};

export default AccountHeaderOptions;

import { useRef, useState } from "react";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";
import { Button, PubKey } from "@/components";
import { useOutsideAlerter } from "@/src/hooks/useOutsideAlerter";
import Link from "next/link";
import { BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { IS_CUSTODIAL } from "@/src/constants";
import { useDebugMode } from "@/src/providers/debugModeProvider";
import classNames from "classnames";
import { UserIcon } from "lucide-react";

const AccountHeaderOptions = () => {
  const { currentUser, logout, currentWallet } = useUserWallet();
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowOptions(false);
  });

  return (
    <div className="relative">
      <div
        className="cursor-pointer w-[32px] h-[32px]"
        onClick={() => {
          setShowOptions(!showOptions);
        }}
        id="account-options"
      >
        {!!currentUser ? (
          <Image
            src={currentUser.picture}
            width={32}
            height={32}
            className="rounded-full"
            alt="user profile picture"
          />
        ) : (
          <div className="rounded-full border border-neutral200 bg-neutral100 overflow-hidden flex items-center justify-center">
            <UserIcon size={24} />
          </div>
        )}
      </div>
      <div
        className={`${
          !showOptions && "hidden"
        } z-50 absolute items-center justify-center 
          ${IS_CUSTODIAL ? "left-[-120px]" : "left-[-105px]"} 
          top-[50px] bg-white w-[220px] rounded-[20px] shadow-md`}
        ref={wrapperRef}
      >
        {currentUser ? (
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
            className="flex h-[48px] py-[6px] items-center justify-center 
            border-b-gray-400 border-b-[1px] hover:bg-bgLancer text-gray-800 
            transition-colors duration-300 ease-in-out"
          >
            Profile
          </Link>
        ) : (
          <Link
            href={"/api/auth/login"}
            id="logout-link"
            className="flex h-[48px] py-[6px] items-center justify-center border-b border-gray-400
              hover:bg-bgLancer text-gray-800 transition-colors duration-300 ease-in-out"
          >
            Login
          </Link>
        )}

        <Link
          href={"https://discord.gg/gqSpskjvxy"}
          target="_blank"
          id="discord-link"
          className="flex h-[48px] border-b-gray-400 border-b-[1px] py-[6px] items-center justify-center
            hover:bg-bgLancer text-gray-800 transition-colors duration-300 ease-in-out"
        >
          Discord
        </Link>

        {!IS_CUSTODIAL && currentUser && (
          <Link
            href={"/api/auth/logout"}
            id="logout-link"
            className="flex h-[48px] py-[6px] items-center justify-center border-b-gray-400 border-b-[1px]
              hover:bg-bgLancer text-gray-800 transition-colors duration-300 ease-in-out"
          >
            Logout
          </Link>
        )}
        {IS_CUSTODIAL && currentUser && currentWallet?.publicKey && (
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
            "flex w-full h-[48px]  rounded-b-[20px] hover:bg-bgLancer py-[8px] items-center justify-center transition-colors duration-300 ease-in-out",
            isDebugMode
              ? "text-white bg-bgLancerSecondary"
              : "hover:bg-turquoise-500 text-gray-800 "
          )}
          onClick={() => setIsDebugMode(!isDebugMode)}
        >{`Debug ${isDebugMode ? "On" : "Off"}`}</Button>
      </div>
    </div>
  );
};

export default AccountHeaderOptions;

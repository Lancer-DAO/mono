import { useUserWallet } from "@/src/providers";
import { LinkButton, ApiKeyModal, Button, PubKey } from "@/components";
import { useEffect, useRef, useState } from "react";
import { useOutsideAlerter } from "@/src/hooks/useOutsideAlerter";
import Link from "next/link";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE,
  GITHUB_API_KEY_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { IS_CUSTODIAL } from "@/src/constants";

const AccountHeaderOptions = () => {
  const { currentUser, logout, currentWallet } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();

  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowOptions(false);
  });
  return (
    <div className="relative ">
      {true && (
        <>
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
            <img
              src={`https://avatars.githubusercontent.com/u/${
                currentUser?.githubId?.split("|")[1]
              }?s=60&v=4`}
              className="h-[40px] w-[40px] rounded-full border-[1px] border-gray-600"
            />
          </div>
          {showOptions && (
            <div
              className="absolute items-center justify-center left-[-105px] top-[50px]  
              bg-white w-[250px] rounded-[20px] shadow-md"
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
                border-b-gray-400 border-b-[1px] hover:bg-turquoise-500 text-gray-800 
                hover:text-white-100 transition-colors duration-300 ease-in-out"
              >
                Account
              </Link>

              <Link
                href={"https://discord.gg/gqSpskjvxy"}
                target="_blank"
                id="discord-link"
                className="flex h-[48px] border-b-gray-400 border-b-[1px] py-[6px] items-center justify-center  hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
              >
                Discord
              </Link>
              <Link
                href={
                  "https://lancerworks.notion.site/Lancer-Documentation-ed924cd3b28e44e3bf90fb5db1dc46d3?pvs=4"
                }
                id="documentation-link"
                target="_blank"
                className="flex h-[48px] border-b-gray-400 border-b-[1px] py-[6px] items-center justify-center  hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
              >
                Documentation
              </Link>

              {!IS_CUSTODIAL && (
                <Link
                  href={"/api/auth/logout"}
                  id="logout-link"
                  className="flex h-[48px] rounded-b-[20px] py-[6px] items-center justify-center  hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
                >
                  Logout
                </Link>
              )}
              {IS_CUSTODIAL && (
                <>
                  <Button
                    onClick={logout}
                    id="logout-link"
                    className="flex w-full h-[48px] border-b-gray-400 py-[6px] items-center justify-center  hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
                  >
                    Logout
                  </Button>
                  <PubKey pubKey={currentWallet.publicKey} />
                </>
              )}
            </div>
          )}
          <ApiKeyModal showModal={showModal} setShowModal={setShowModal} />
        </>
      )}
    </div>
  );
};

export default AccountHeaderOptions;

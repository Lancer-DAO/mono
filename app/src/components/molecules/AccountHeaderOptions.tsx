import { useLancer } from "@/src/providers";
import { LinkButton, ApiKeyModal } from "@/components";
import { useEffect, useRef, useState } from "react";
import { useOutsideAlerter } from "@/src/hooks/useOutsideAlerter";

import dynamic from "next/dynamic";
import { Key, HelpCircle } from "react-feather";
import Link from "next/link";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE,
  GITHUB_API_KEY_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";

const AccountHeaderOptions = () => {
  const {
    currentUser,
    currentAPIKey,
    currentTutorialState,
    setCurrentTutorialState,
  } = useLancer();
  const [hasExtension, setHasExtension] = useState(false);
  useEffect(() => {
    try {
      const extensionId = localStorage.getItem("lancerExtensionId");
      chrome.runtime.sendMessage(
        extensionId,
        { message: "test connection" },
        function (response) {
          if (response.connected) setHasExtension(true);
        }
      );
    } catch (e) {
      console.error(e);
    }
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowOptions(false);
  });
  return (
    <div className="relative ">
      {currentUser !== null ? (
        <>
          <div
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
              className="absolute items-center justify-center left-[-105px] top-[50px]  bg-white w-[250px] rounded-[20px] shadow-md"
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
                className="flex rounded-t-[20px] h-[48px] py-[6px] items-center justify-center border-b-gray-400 border-b-[1px] hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
              >
                Account
              </Link>
              {/* <button
                onClick={() => {
                  setShowModal(true);

                  if (!!currentTutorialState && currentTutorialState.isActive) {
                    if (
                      currentTutorialState?.title ===
                        GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                      currentTutorialState.currentStep === 1
                    ) {
                      setCurrentTutorialState({
                        ...currentTutorialState,
                        currentStep: 2,
                      });
                    }
                  }
                }}
                id="api-key-link"
                className="flex h-[48px] w-full gap-[10px] py-[6px] items-center justify-center border-b-gray-400 border-b-[1px] hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
              >
                <Key />
                {currentAPIKey ? currentAPIKey.name : "Set API Key"}
              </button> */}
              <Link
                href={"/download_extension"}
                id="download-extension-link"
                className="flex  h-[48px] py-[6px] items-center justify-center border-b-gray-400 border-b-[1px] hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
              >
                {hasExtension ? "Extension Detected" : "Download Extension"}
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

              <Link
                href={"/api/auth/logout"}
                id="logout-link"
                className="flex h-[48px] rounded-b-[20px] py-[6px] items-center justify-center  hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
              >
                Logout
              </Link>
            </div>
          )}
          <ApiKeyModal showModal={showModal} setShowModal={setShowModal} />
        </>
      ) : (
        <LinkButton href="/api/auth/login"> Login</LinkButton>
      )}
    </div>
  );
};

export default AccountHeaderOptions;

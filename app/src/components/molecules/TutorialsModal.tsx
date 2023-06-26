import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import {
  ExternalLink,
  RefreshCcw,
  Play,
  Pause,
  HelpCircle,
} from "react-feather";
import { Button } from "@/components";

import { FC, useRef } from "react";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";
import { LinkButton } from "..";
import { useRouter } from "next/router";
import { ALL_TUTORIALS } from "@/src/constants/tutorials";
import { Tutorial } from "@/src/types/tutorials";

const TutorialRow: FC<{
  tutorial: Tutorial;
  type: "current" | "available" | "unavailable";
  setShowModal?: (show: boolean) => void;
}> = ({ tutorial, type, setShowModal }) => {
  const router = useRouter();
  const { currentTutorialState, setCurrentTutorialState } = useLancer();
  const [isPageButtonHovered, setIsPageButtonHovered] = useState(false);
  const [isPlayButtonHovered, setIsPlayButtonHovered] = useState(false);
  const [isResetButtonHovered, setIsResetButtonHovered] = useState(false);

  return (
    <div className="flex items-center">
      <h4 className="mr-[50px]">{tutorial.title}</h4>
      <div className="ml-auto items-center">
        <div className="flex items-center">
          {type === "current" && (
            <>
              <Button
                version="text"
                extraClasses="mr-[10px]"
                onClick={() => {
                  setCurrentTutorialState(null);

                  setShowModal(false);
                  // need to give the props a full refresh for joyride to properly reset
                  setTimeout(() => {
                    setCurrentTutorialState(tutorial);
                  }, 100);
                }}
              >
                <RefreshCcw
                  onMouseEnter={() => setIsResetButtonHovered(true)}
                  onMouseLeave={() => setIsResetButtonHovered(false)}
                  color={isResetButtonHovered ? "#14bb88" : "#000"}
                  height={24}
                  width={24}
                />
              </Button>
              <Button
                version="text"
                onClick={() => {
                  if (currentTutorialState.isActive) {
                    setCurrentTutorialState({
                      ...currentTutorialState,
                      isRunning: !currentTutorialState.isRunning,
                    });
                    if (!currentTutorialState.isRunning) {
                      setShowModal(false);
                    }
                  }
                }}
              >
                {currentTutorialState.isRunning ? (
                  <Pause
                    onMouseEnter={() => setIsPlayButtonHovered(true)}
                    onMouseLeave={() => setIsPlayButtonHovered(false)}
                    color={isPlayButtonHovered ? "#14bb88" : "#000"}
                    height={24}
                    width={24}
                  />
                ) : (
                  <Play
                    onMouseEnter={() => setIsPlayButtonHovered(true)}
                    onMouseLeave={() => setIsPlayButtonHovered(false)}
                    color={isPlayButtonHovered ? "#14bb88" : "#000"}
                    height={24}
                    width={24}
                  />
                )}
              </Button>
            </>
          )}
          {type === "available" && (
            <Button
              version="text"
              onClick={() => {
                setCurrentTutorialState(tutorial);
                setShowModal(false);
              }}
            >
              <Play
                onMouseEnter={() => setIsPlayButtonHovered(true)}
                onMouseLeave={() => setIsPlayButtonHovered(false)}
                color={isPlayButtonHovered ? "#14bb88" : "#000"}
                height={24}
                width={24}
              />
            </Button>
          )}
          {type === "unavailable" && (
            <Button
              version="text"
              onClick={() => {
                if (tutorial.pages.includes("bounty")) {
                  router.push(`/bounties`);
                } else {
                  router.push(`/${tutorial.pages[0]}`);
                }
              }}
              hoveredText={
                tutorial.pages.includes("bounty")
                  ? "You must select a bounty from the bounty list before accessing this tutorial"
                  : undefined
              }
            >
              {tutorial.pages.includes("bounty") ? (
                <HelpCircle
                  onMouseEnter={() => setIsPageButtonHovered(true)}
                  onMouseLeave={() => setIsPageButtonHovered(false)}
                  color={isPageButtonHovered ? "#14bb88" : "#000"}
                  height={24}
                  width={24}
                />
              ) : (
                <ExternalLink
                  onMouseEnter={() => setIsPageButtonHovered(true)}
                  onMouseLeave={() => setIsPageButtonHovered(false)}
                  color={isPageButtonHovered ? "#14bb88" : "#000"}
                  height={24}
                  width={24}
                />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const TutorialsModal: FC<Props> = ({ showModal, setShowModal }) => {
  const wrapperRef = useRef(null);
  const router = useRouter();

  const {
    currentAPIKey,
    setCurrentAPIKey,
    setCurrentTutorialState,
    currentTutorialState,
  } = useLancer();
  useOutsideAlerter(wrapperRef, () => {
    setShowModal(false);
  });
  const currentPage = router.pathname.replace(/[\/\[\]]/g, "");
  const availableTutorials = ALL_TUTORIALS.filter((tutorial) => {
    return (
      currentTutorialState?.title !== tutorial.title &&
      (tutorial.pages.includes(currentPage) || tutorial.pages.includes("all"))
    );
  });
  const unavailableTutorials = ALL_TUTORIALS.filter((tutorial) => {
    return (
      currentTutorialState?.title !== tutorial.title &&
      !(tutorial.pages.includes(currentPage) || tutorial.pages.includes("all"))
    );
  });

  return (
    <>
      {showModal ? (
        <div className="modal-wrapper">
          <div className="modal-inner" ref={wrapperRef}>
            <h2 className="modal-header ">Select A Tutorial</h2>
            {!!currentTutorialState && (
              <>
                <h3>Currently Active</h3>
                <TutorialRow
                  tutorial={currentTutorialState}
                  type="current"
                  setShowModal={setShowModal}
                />
              </>
            )}

            <h3>Available on this Page</h3>
            {availableTutorials.map((tutorial) => (
              <TutorialRow
                tutorial={tutorial}
                type="available"
                setShowModal={setShowModal}
              />
            ))}
            <h3>Remaining Tutorials</h3>
            {unavailableTutorials.map((tutorial) => (
              <TutorialRow tutorial={tutorial} type="unavailable" />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default TutorialsModal;

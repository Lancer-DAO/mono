import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import classnames from "classnames";
import {
  ExternalLink,
  RefreshCcw,
  Play,
  Pause,
  HelpCircle,
  X,
} from "react-feather";
import { Button } from "@/components";

import { FC, useRef } from "react";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";
import { LinkButton } from "..";
import { useRouter } from "next/router";
import {
  ALL_TUTORIALS,
  APPLY_BOUNTY_STEP,
  BOUNTY_ACTIONS_WRAPPER_STEP,
  BOUNTY_CANCELED_STEP,
  BOUNTY_COMPLETED_STEP,
  CANCEL_STEP,
  MANAGE_REQUESTED_SUBMITTER_STEPS,
  REQUEST_DENIED_STEP,
  REQUEST_PENDING_STEP,
  REVIEW_BOUNTY_STEPS,
  SUBMISSION_DENIED_STEP,
  SUBMISSION_PENDING_STEP,
  SUBMIT_REQUEST_HAS_PULL_REQUEST_STEPS,
  SUBMIT_REQUEST_NEEDS_PULL_REQUEST_STEPS,
  VOTE_TO_CANCEL_STEP,
} from "@/src/constants/tutorials";
import { Tutorial } from "@/src/types/tutorials";
import { Step } from "react-joyride";
import { Bounty, BountyState } from "@/src/types";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useBounty } from "@/src/providers/bountyProvider";

const getCurrentBountyTutorialInitialState = (
  currentBounty: Bounty
): Tutorial => {
  const steps: Step[] = [BOUNTY_ACTIONS_WRAPPER_STEP];
  if (currentBounty?.state === BountyState.COMPLETE) {
    steps.push(BOUNTY_COMPLETED_STEP);
  }
  if (currentBounty?.state === BountyState.CANCELED) {
    steps.push(BOUNTY_CANCELED_STEP);
  }
  if (!currentBounty.currentUserRelationsList) {
    steps.push(APPLY_BOUNTY_STEP);
  }
  if (
    (currentBounty.isCreator ||
      currentBounty.isCurrentSubmitter ||
      currentBounty.isDeniedSubmitter ||
      currentBounty.isChangesRequestedSubmitter) &&
    !currentBounty.isVotingCancel
  ) {
    steps.push(VOTE_TO_CANCEL_STEP);
  }
  if (currentBounty.isCreator && currentBounty.needsToVote.length === 0) {
    steps.push(CANCEL_STEP);
  }
  if (currentBounty.isRequestedSubmitter) {
    steps.push(REQUEST_PENDING_STEP);
  }
  if (currentBounty.isDeniedRequester) {
    steps.push(REQUEST_DENIED_STEP);
  }
  if (currentBounty.isApprovedSubmitter && !currentBounty.currentSubmitter) {
    if (currentBounty.pullRequests.length === 0) {
      steps.push(...SUBMIT_REQUEST_NEEDS_PULL_REQUEST_STEPS);
    } else {
      steps.push(...SUBMIT_REQUEST_HAS_PULL_REQUEST_STEPS);
    }
  }
  if (currentBounty.isDeniedRequester) {
    steps.push(SUBMISSION_PENDING_STEP);
  }

  if (currentBounty.isDeniedSubmitter) {
    steps.push(SUBMISSION_DENIED_STEP);
  }

  if (currentBounty.isCreator && currentBounty.requestedSubmitters.length > 0) {
    steps.push(...MANAGE_REQUESTED_SUBMITTER_STEPS);
  }

  if (currentBounty.isCreator && currentBounty.currentSubmitter) {
    steps.push(...REVIEW_BOUNTY_STEPS);
  }

  return {
    title: "Current Bounty Actions",
    pages: ["bounty"],
    isActive: true,
    isRunning: true,
    currentStep: 0,
    spotlightClicks: false,
    steps,
  };
};

const TutorialRow: FC<{
  tutorial: Tutorial;
  type: "current" | "available" | "unavailable";
  setShowModal?: (show: boolean) => void;
}> = ({ tutorial, type, setShowModal }) => {
  const router = useRouter();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
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
                }}
                hoveredText="Clear current tutorial"
              >
                <X
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
                hoveredText={currentTutorialState.isRunning ? "Pause" : "Play"}
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
              hoveredText="Start Tutorial"
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
  const { currentTutorialState } = useTutorial();

  const { currentBounty } = useBounty();
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
  if (currentPage === "bounty" && !!currentBounty) {
    availableTutorials.push(
      getCurrentBountyTutorialInitialState(currentBounty)
    );
  }
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

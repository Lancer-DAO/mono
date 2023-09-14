import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IS_CUSTODIAL } from "@/src/constants";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { ProfileNFT, User } from "@/types/";
import { api } from "@/utils";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingBar, ResumeModal } from "@/components";
import { ProfileNFTCard, QuestsCard } from "./components";
import BadgesCard from "./components/BadgesCard";
import PortfolioCard from "./components/PortfolioCard";
import { ReferCard } from "./components/ReferCard";
import ResumeCard from "./components/ResumeCard";
import { useAccount } from "@/src/providers/accountProvider";

dayjs.extend(relativeTime);

const underdogClient = createUnderdogClient({});

interface Props {
  self: boolean;
}

export const Account: FC<Props> = ({ self }) => {
  const router = useRouter();

  // api + context
  const { currentUser, currentWallet } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { account } = useAccount();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(
    self ? currentUser?.resume : account?.resume
  );

  useEffect(() => {
    if (!!account && !!currentWallet) {
      const fetchNfts = async () => {
        if (
          currentTutorialState?.title ===
            BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
          currentTutorialState.currentStep === 8
        ) {
          setCurrentTutorialState({
            ...currentTutorialState,
            isRunning: true,
          });
        } else if (
          currentTutorialState?.title ===
            PROFILE_TUTORIAL_INITIAL_STATE.title &&
          currentTutorialState.currentStep === 2
        ) {
          setTimeout(() => {
            setCurrentTutorialState({
              ...currentTutorialState,
              isRunning: true,
              currentStep: 3,
              spotlightClicks: false,
            });
          }, 100);
        }
      };
      fetchNfts();
    }
  }, [account, currentWallet, currentTutorialState]);

  // check for resume in user object
  useEffect(() => {
    if (!!currentUser && currentUser.resume === null) {
      setShowResumeModal(true);
    }
  }, [currentUser]);

  if (!IS_CUSTODIAL && !currentWallet)
    return (
      <div className="w-full md:w-[90%] items-center justify-center flex flex-col mx-auto px-4 md:px-0 py-24">
        Please Connect a Wallet
      </div>
    );

  if (!self && !account.hasFinishedOnboarding)
    return (
      <div className="w-full md:w-[90%] items-center justify-center flex flex-col mx-auto px-4 md:px-0 py-24">
        This user has not finished onboarding yet. They must complete onboarding
        before their profile is viewable
      </div>
    );

  return (
    <>
      <div className="w-full md:w-[90%] items-center justify-center flex flex-col mx-auto px-4 md:px-0 py-24">
        {account ? (
          <div className="flex gap-5">
            {/* left column */}
            <div className="flex flex-col gap-5 w-full md:max-w-[482px]">
              <h1 className="pb-2">{`${
                self ? "Your Profile" : `@${account?.name}`
              }`}</h1>
              <ProfileNFTCard
                picture={account.picture}
                githubId={account.githubId}
                user={account}
                self={self}
                id={account.id}
              />
              <BadgesCard />
              {account.id === currentUser.id && currentUser.hasBeenApproved && (
                <ReferCard />
              )}
            </div>
            {/* right column */}
            <div className="flex flex-col gap-5 w-full">
              <h1 className="pb-2 invisible">{`${
                self ? "Your Profile" : `@${account?.name}`
              }`}</h1>
              <PortfolioCard />
              {account.id === currentUser.id && (
                <ResumeCard resumeUrl={resumeUrl} setResumeUrl={setResumeUrl} />
              )}
              <QuestsCard user={account} />
            </div>
          </div>
        ) : (
          <div className="w-full flex items-start gap-5">
            <LoadingBar title="Loading Profile" />
          </div>
        )}
      </div>
      {/* resume modal */}
      {showResumeModal && (
        <ResumeModal
          resumeUrl={resumeUrl}
          setResumeUrl={setResumeUrl}
          setShowModal={setShowResumeModal}
        />
      )}
    </>
  );
};

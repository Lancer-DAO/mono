import { FC, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IS_CUSTODIAL } from "@/src/constants";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { ProfileNFT } from "@/types/";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingBar, ProgressBar } from "@/components";
import {
  BadgesCard,
  PortfolioCard,
  ReferCard,
  ResumeCard,
  ProfileNFTCard,
  QuestsCard,
  CompleteProfileModal,
} from "./components";
import { useAccount } from "@/src/providers/accountProvider";
import { api } from "@/src/utils";

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
  const { data: media } = api.media.getMedia.useQuery(
    {
      userId: currentUser?.id,
    },
    {
      enabled: !!currentUser,
    }
  );
  const { mutateAsync: updateHasCompletedProfile } =
    api.users.updateHasCompletedProfile.useMutation();

  const { account } = useAccount();
  const [resumeUrl, setResumeUrl] = useState(
    self ? currentUser?.resume : account?.resume
  );
  const [profileProgress, setProfileProgress] = useState(0);
  const [showCompleteProfileModal, setShowCompleteProfileModal] =
    useState<boolean>(false);

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

  useEffect(() => {
    const getProgress = () => {
      let progress = 0;
      if (account.name !== "") {
        progress += 20;
      }
      if (account.bio !== "") {
        progress += 40;
      }
      if (
        account.website !== "" ||
        account.twitter !== "" ||
        account.github !== "" ||
        account.linkedin !== ""
      ) {
        progress += 20;
      }
      if (media?.length > 0) {
        progress += 20;
      }
      setProfileProgress(progress);
    };

    if (account) {
      getProgress();
    }
  }, [account, media]);

  useEffect(() => {
    if (
      !!currentUser &&
      profileProgress === 100 &&
      currentUser.hasCompletedProfile === false
    ) {
      updateHasCompletedProfile({ id: currentUser.id });
      setShowCompleteProfileModal(true);
    }
  }, [currentUser, profileProgress]);

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
        {account && currentUser ? (
          <div className="flex gap-5">
            {/* left column */}
            <div className="flex flex-col gap-2 w-full md:max-w-[482px]">
              <h1 className="mb-3 whitespace-nowrap h-[50px]">{`${
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
              <div
                className={`${
                  self && currentUser.hasCompletedProfile === false
                    ? "visible"
                    : "invisible"
                } w-1/2 flex items-end ml-auto gap-2 h-[50px]`}
              >
                <div className="w-full flex flex-col items-center gap-0.5">
                  <p className="text-sm text-neutral400">
                    Complete your profile
                  </p>
                  <ProgressBar progress={profileProgress} />
                </div>
                <span className="w-fit text-sm text-neutral400">
                  {profileProgress}%
                </span>
              </div>
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
      {showCompleteProfileModal ? (
        <CompleteProfileModal setShowModal={setShowCompleteProfileModal} />
      ) : null}
    </>
  );
};

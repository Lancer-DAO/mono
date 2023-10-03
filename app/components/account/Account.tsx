import { FC, useEffect, useState } from "react";
import { IS_CUSTODIAL } from "@/src/constants";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useAccount } from "@/src/providers/accountProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { api } from "@/src/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingBar, ProgressBar } from "@/components";
import {
  CompleteProfileModal,
  PortfolioCard,
  ProfileCard,
  QuestsCard,
} from "./components";

dayjs.extend(relativeTime);

interface Props {
  self: boolean;
}

export const Account: FC<Props> = ({ self }) => {
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

  // if (!IS_CUSTODIAL && !currentWallet)
  //   return (
  //     <div className="w-full md:w-[90%] items-center justify-center flex flex-col mx-auto px-4 md:px-0 py-24">
  //       Please Connect a Wallet
  //     </div>
  //   );

  if (!self && !account.hasFinishedOnboarding)
    return (
      <div className="w-full md:w-[90%] items-center justify-center flex flex-col mx-auto px-4 md:px-0 py-24">
        This user has not finished onboarding yet. They must complete onboarding
        before their profile is viewable
      </div>
    );

  return (
    <>
      <div className="w-full md:w-[95%] max-w-[1600px] items-center justify-center flex flex-col mx-auto px-4 md:px-0 py-24">
        {account && currentUser ? (
          <div className="w-full flex gap-5 justify-center">
            {/* left column */}
            <div className="w-full max-w-[600px]">
              <ProfileCard
                picture={account.picture}
                githubId={account.githubId}
                user={account}
                self={self}
                id={account.id}
              />
            </div>
            {/* right column */}
            <div className="flex flex-col gap-5 w-full">
              {self && currentUser.hasCompletedProfile === false && (
                <div className={`w-1/2 flex items-end ml-auto gap-2 h-[50px]`}>
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
              )}

              <PortfolioCard />
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

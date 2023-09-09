import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IS_CUSTODIAL, PROFILE_PROJECT_PARAMS } from "@/src/constants";
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
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const { account } = useAccount();
  console.log("account", account);

  const fetchProfileNFT = async () => {
    const walletKey =
      router.query.account !== undefined
        ? account?.wallets.filter((wallet) => wallet.hasProfileNFT)[0]
            ?.publicKey
        : currentWallet.publicKey.toString();
    const nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: walletKey,
      },
    });

    if (nfts.totalResults > 0) {
      const { attributes, image } = nfts.results[0];
      const profileNFT: ProfileNFT = {
        name: account?.name,
        reputation: attributes.reputation as number,
        badges:
          attributes.badges !== ""
            ? (attributes.badges as string)?.split(",")
            : [],
        certifications:
          attributes.certifications !== ""
            ? (attributes.certifications as string)?.split(",")
            : [],
        image: image,
        lastUpdated: attributes.lastUpdated
          ? dayjs(attributes.lastUpdated)
          : undefined,
      };
      setProfileNFT(profileNFT);
    }
  };

  useEffect(() => {
    if (!!account && !!currentWallet) {
      const fetchNfts = async () => {
        await fetchProfileNFT();

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

  // check for "newUser" key in local storage
  useEffect(() => {
    if (localStorage.getItem("newUser")) {
      setShowResumeModal(true);
    }
  }, []);

  if (!IS_CUSTODIAL && !currentWallet && !profileNFT)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Please Connect a Wallet
      </div>
    );

  return (
    <>
      <div className="w-full md:w-[90%] mx-auto px-4 md:px-0 py-10">
        <div className="flex items-center">
          <h1 className="pb-2">{`${
            self ? "Your Profile" : `@${account?.name}`
          }`}</h1>
        </div>
        {profileNFT && account ? (
          <div className="w-full flex items-start gap-5">
            {/* left column */}
            <div className="flex flex-col gap-5 w-full md:max-w-[482px]">
              <ProfileNFTCard
                profileNFT={profileNFT}
                picture={account.picture}
                githubId={account.githubId}
                user={account}
                self={self}
                id={account.id}
              />
              <BadgesCard profileNFT={profileNFT} />
              {account.id === currentUser.id && currentUser.hasBeenApproved && (
                <ReferCard />
              )}
            </div>
            {/* right column */}
            <div className="flex flex-col gap-5 w-full">
              <PortfolioCard />
              {account.id === currentUser.id && <ResumeCard />}
              <QuestsCard />
            </div>
          </div>
        ) : (
          <div className="w-full flex items-start gap-5">
            <LoadingBar title="Loading Profile" />
          </div>
        )}
      </div>
      {/* resume modal */}
      {showResumeModal && <ResumeModal setShowModal={setShowResumeModal} />}
    </>
  );
};

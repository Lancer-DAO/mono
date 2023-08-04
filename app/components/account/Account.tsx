import { useEffect, useState, FC } from "react";
import { useRouter } from "next/router";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { DefaultLayout, LoadingBar } from "@/components";
import { BountyNFTCard, ProfileNFTCard } from "./components";
import {
  BOUNTY_PROJECT_PARAMS,
  IS_CUSTODIAL,
  PROFILE_PROJECT_PARAMS,
} from "@/src/constants";
import { api } from "@/utils";
import { BountyNFT, ProfileNFT, User } from "@/types/";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useTutorial } from "@/src/providers/tutorialProvider";

export const getServerSideProps = withPageAuthRequired();

dayjs.extend(relativeTime);

const underdogClient = createUnderdogClient({});

export const Account: FC = () => {
  const router = useRouter();

  const { currentUser, currentWallet } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();
  const [bountyNFTs, setBountyNFTs] = useState<BountyNFT[]>([]);
  const { mutateAsync: getUser } = api.users.getUser.useMutation();
  const [account, setAccount] = useState<User>();
  const [bountiesLoading, setBountiesLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileCreating, setProfileCreating] = useState(false);

  const { mutateAsync: registerProfileNFT } =
    api.users.registerProfileNFT.useMutation();

  useEffect(() => {
    const maybeMintNft = async () => {
      if (!!currentUser && !!currentWallet && router.query.id === undefined) {
        if (!currentUser.profileWalletId) {
          setProfileCreating(true);
          await mintProfileNFT();
          setProfileCreating(false);
        }
      }
    };
    maybeMintNft();
  }, [currentUser, router.isReady, currentWallet]);

  const fetchProfileNFT = async () => {
    setProfileLoading(true);
    const profileNFTHolder = account.wallets.find(
      (wallet) => wallet.id === account.profileWalletId
    );
    const nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: profileNFTHolder?.publicKey,
      },
    });
    if (nfts.totalResults > 0) {
      const { name, attributes, image } = nfts.results[0];
      const profileNFT: ProfileNFT = {
        name: name,
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
    setProfileLoading(false);
  };

  const fetchBountyNFTs = async () => {
    setBountiesLoading(true);
    const profileNFTHolder = account.wallets.find(
      (wallet) => wallet.id === account.profileWalletId
    );
    const nfts = await underdogClient.getNfts({
      params: BOUNTY_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 10,
        ownerAddress: profileNFTHolder?.publicKey,
      },
    });
    const bountyNFTs: BountyNFT[] = nfts.results.map((nft) => {
      const { name, attributes, image } = nft;
      return {
        name: name,
        reputation: attributes.reputation as number,
        tags:
          attributes.tags !== "" ? (attributes.tags as string)?.split(",") : [],
        image: image,
        completed: attributes.completed
          ? dayjs(attributes.completed)
          : undefined,
        description: attributes.description as string,
        role: attributes.role as string,
      };
    });
    bountyNFTs.reverse();
    setBountyNFTs(bountyNFTs);
    setBountiesLoading(false);
  };

  const mintProfileNFT = async () => {
    if (
      currentTutorialState?.title === PROFILE_TUTORIAL_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 2
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }
    const nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: currentWallet.publicKey.toString(),
      },
    });
    if (nfts.totalResults === 0) {
      const result = await underdogClient.createNft({
        params: PROFILE_PROJECT_PARAMS,
        body: {
          name: `${currentUser.name}`,
          image: "https://i.imgur.com/3uQq5Zo.png",
          attributes: {
            reputation: 0,
            badges: "",
            certifications: "",
            lastUpdated: dayjs().toISOString(),
          },
          upsert: true,
          receiverAddress: currentWallet.publicKey.toString(),
        },
      });
    }

    const updatedUser = await registerProfileNFT({
      walletPublicKey: currentWallet.publicKey.toString(),
    });
    setAccount(updatedUser);
  };

  useEffect(() => {
    if (router.query.id !== undefined) {
      const fetchAccount = async () => {
        const account = await getUser({
          id: parseInt(router.query.id as string),
        });
        setAccount(account);
      };
      fetchAccount();
    } else {
      setAccount(currentUser);
    }
  }, [currentUser, router.isReady]);

  useEffect(() => {
    const fetchNfts = async () => {
      await fetchProfileNFT();

      await fetchBountyNFTs();
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
        currentTutorialState?.title === PROFILE_TUTORIAL_INITIAL_STATE.title &&
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
    if (account && account.profileWalletId) {
      fetchNfts();
    }
  }, [account]);

  return (
    <>
      {account && (
        <div className="w-full flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-5 justify-center">
          {!IS_CUSTODIAL && !currentWallet && !profileNFT && (
            <div>Please Connect a Wallet</div>
          )}
          {profileLoading && <LoadingBar title="Loading Profile" />}
          {profileCreating && <LoadingBar title="Creating Profile" />}
          {profileNFT && (
            <>
              <ProfileNFTCard
                profileNFT={profileNFT}
                picture={account.picture}
                githubId={account.githubId}
              />

              <div
                className="flex flex-col gap-3 w-full md:w-[60%] px-5 pb-20"
                id="bounties-list"
              >
                <p className="text-4xl flex items-center justify-center pb-3">
                  Completed Bounties
                </p>
                {bountiesLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                  </div>
                ) : bountyNFTs.length > 0 ? (
                  bountyNFTs.map((bountyNFT) => (
                    <BountyNFTCard bountyNFT={bountyNFT} />
                  ))
                ) : (
                  <div className="w-full text-center">No bounties yet!</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

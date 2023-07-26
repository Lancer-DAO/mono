import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useUserWallet } from "@/src/providers";
import dynamic from "next/dynamic";
import {
  DefaultLayout,
  ProfileNFTCard,
  CoinflowOfframp,
  Button,
  BountyNFTCard,
  JoyrideWrapper,
  ApiKeyModal,
  LoadingBar,
} from "@/components";
import {
  BOUNTY_PROJECT_PARAMS,
  IS_CUSTODIAL,
  IS_MAINNET,
  PROFILE_PROJECT_PARAMS,
} from "@/src/constants";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "@/src/utils/api";
import { BountyNFT, CurrentUser, ProfileNFT } from "@/src/types";
import { last } from "lodash";
export const getServerSideProps = withPageAuthRequired();

import {
  createUnderdogClient,
  useProject,
  Nft,
  NetworkEnum,
} from "@underdog-protocol/js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AddReferrerModal from "@/components/molecules/AddReferrerModal";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { Key } from "react-feather";
import { useTutorial } from "@/src/providers/tutorialProvider";
dayjs.extend(relativeTime);

const underdogClient = createUnderdogClient({});
export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Account</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        <Account />
      </main>
    </>
  );
}

const Account: React.FC = () => {
  const router = useRouter();

  const { currentUser, currentWallet } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();
  const [bountyNFTs, setBountyNFTs] = useState<BountyNFT[]>([]);
  const { mutateAsync: getUser } = api.users.getUser.useMutation();
  const [account, setAccount] = useState<CurrentUser>();
  const [showModal, setShowModal] = useState(false);
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

  return (
    <DefaultLayout>
      {account && (
        <>
          <div className="w-full flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-5 justify-center">
            {/* <ApiKeyModal showModal={showModal} setShowModal={setShowModal} /> */}
            {/* {currentUser?.githubLogin && (
                <div>GitHub User: {currentUser.githubLogin}</div>
              )}
                <a href="/api/auth/logout">Logout</a> */}
            {/* {wallets &&
                wallets.map((wallet) => (
                  <WalletInfo wallet={wallet} key={wallet.publicKey.toString()} />
                ))} */}
            {/* {!IS_MAINNET && (
                  <a
                    href="https://staging.coinflow.cash/faucet"
                    target={"_blank"}
                    rel="noreferrer"
                  >
                    USDC Faucet
                  </a>
                )} */}
            {!IS_CUSTODIAL && !currentWallet && (
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
        </>
      )}
    </DefaultLayout>
  );
};

import { useEffect, useState, FC } from "react";
import { useRouter } from "next/router";
import { LoadingBar } from "@/components";
import { QuestsCard, ProfileNFTCard } from "./components";
import {
  BOUNTY_PROJECT_PARAMS,
  IS_CUSTODIAL,
  PROFILE_PROJECT_PARAMS,
} from "@/src/constants";
import { api } from "@/utils";
import { BountyNFT, IAsyncResult, ProfileNFT, User } from "@/types/";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useTutorial } from "@/src/providers/tutorialProvider";
import BadgesCard from "./components/BadgesCard";

dayjs.extend(relativeTime);

const underdogClient = createUnderdogClient({});

export const Account: FC = () => {
  const router = useRouter();

  const { currentUser, currentWallet } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();
  const [bountyNFTs, setBountyNFTs] = useState<IAsyncResult<BountyNFT[]>>({
    isLoading: true,
  });
  const { mutateAsync: getUser } = api.users.getUser.useMutation();
  const { mutateAsync: verifyWallet } = api.users.verifyWallet.useMutation();
  const [account, setAccount] = useState<IAsyncResult<User>>({
    isLoading: true,
    loadingPrompt: "Loading Profile",
  });

  const { mutateAsync: registerProfileNFT } =
    api.users.registerProfileNFT.useMutation();

  useEffect(() => {
    const getUserAsync = async () => {
      if (router.query.id !== undefined) {
        const fetchAccount = async () => {
          const account = await getUser({
            id: parseInt(router.query.id as string),
          });
          setAccount({ ...account, result: account });
        };
        fetchAccount();
      } else {
        try {
          let loadingPrompt = "Loading Profile";
          setAccount({ isLoading: true, loadingPrompt });
          setBountyNFTs({ isLoading: true });
          setProfileNFT(null);

          const verifiedWallet = await verifyWallet({
            walletPublicKey: currentWallet?.publicKey.toString(),
          });

          if (!verifiedWallet.hasProfileNFT) {
            loadingPrompt = "Creating Profile";
            setAccount({ isLoading: true, loadingPrompt });
            await mintProfileNFT();
          }

          setAccount({
            isLoading: true,
            loadingPrompt,
            result: currentUser,
            error: null,
          });
        } catch (e) {
          setAccount({ error: e });
        }
      }
    };
    if (!!currentUser && !!currentWallet?.publicKey) {
      getUserAsync();
    }
  }, [currentUser, router.isReady, currentWallet?.publicKey]);

  useEffect(() => {
    if (account.result) {
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
  }, [account?.result]);

  const fetchProfileNFT = async () => {
    const nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: currentWallet.publicKey.toString(),
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
    setAccount({ ...account, isLoading: false, loadingPrompt: undefined });
  };

  const fetchBountyNFTs = async () => {
    const nfts = await underdogClient.getNfts({
      params: BOUNTY_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 100,
        ownerAddress: currentWallet.publicKey.toString(),
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
    setBountyNFTs({ isLoading: false, result: bountyNFTs });
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
    await registerProfileNFT({
      walletPublicKey: currentWallet.publicKey.toString(),
    });
  };

  if (!IS_CUSTODIAL && !currentWallet && !profileNFT)
    return <div>Please Connect a Wallet</div>;

  if (account.error) {
    return <div className="color-red">{account.error.message}</div>;
  }
  if (account.isLoading) {
    return <LoadingBar title={account.loadingPrompt} />;
  }
  return (
    <>
      {/* {profileNFT && ( */}
      {account?.result && (
        <div className="w-full flex items-start gap-5 px-5 md:px-32">
          {/* left column */}
          <div className="flex flex-col gap-5 w-full md:max-w-[482px]">
            <ProfileNFTCard
              profileNFT={profileNFT}
              picture={account?.result.picture}
              githubId={account?.result.githubId}
            />
            <BadgesCard profileNFT={profileNFT} />
          </div>
          <div className="flex flex-col gap-10 w-full">
            <QuestsCard bountyNFTs={bountyNFTs} />
          </div>
        </div>
      )}
    </>
  );
};

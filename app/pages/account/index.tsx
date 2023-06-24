import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useLancer } from "@/src/providers";
import dynamic from "next/dynamic";
import {
  DefaultLayout,
  ProfileNFTCard,
  CoinflowOfframp,
  Button,
  BountyNFTCard,
  JoyrideWrapper,
} from "@/src/components";
import {
  BOUNTY_PROJECT_PARAMS,
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

  const { currentUser, currentWallet } = useLancer();
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();
  const [bountyNFTs, setBountyNFTs] = useState<BountyNFT[]>([]);
  const { mutateAsync: getUser } = api.users.getUser.useMutation();
  const [account, setAccount] = useState<CurrentUser>();

  const { mutateAsync: registerProfileNFT } =
    api.users.registerProfileNFT.useMutation();
  const fetchProfileNFT = async () => {
    const profileNFTHolder = account.wallets.find(
      (wallet) => wallet.id === account.profileWalletId
    );
    const nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: profileNFTHolder.publicKey,
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
  };

  const fetchBountyNFTs = async () => {
    const profileNFTHolder = account.wallets.find(
      (wallet) => wallet.id === account.profileWalletId
    );
    const nfts = await underdogClient.getNfts({
      params: BOUNTY_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 10,
        ownerAddress: profileNFTHolder.publicKey,
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

      // if (isTutorialActive) {
      //   setIsTutorialRunning(true);
      //   // setCurrentTutorialStep(3);
      // }
      await fetchBountyNFTs();
    };
    if (account && account.profileWalletId) {
      fetchNfts();
    }
  }, [account]);

  const mintProfileNFT = async () => {
    // if (isTutorialActive) {
    //   setIsTutorialRunning(false);
    // }
    //   const result = await underdogClient.createNft({
    //     params: PROFILE_PROJECT_PARAMS,
    //     body: {
    //       name: `${account.githubLogin}`,
    //       image: "https://i.imgur.com/3uQq5Zo.png",
    //       attributes: {
    //         reputation: 0,
    //         badges: "",
    //         certifications: "",
    //         lastUpdated: dayjs().toISOString(),
    //       },
    //       upsert: true,
    //       receiverAddress: currentWallet.publicKey.toString(),
    //     },
    //   });
    const updatedUser = await registerProfileNFT({
      walletPublicKey: currentWallet.publicKey.toString(),
    });
    setAccount(updatedUser);
  };

  return (
    <DefaultLayout>
      {account && (
        <>
          <div className="account-page-wrapper">
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
            {profileNFT ? (
              <>
                <ProfileNFTCard
                  profileNFT={profileNFT}
                  githubId={account.githubId}
                />

                <div className="profile-bounty-list" id="bounties-list">
                  <h2>Bounties</h2>
                  {bountyNFTs.length > 0 ? (
                    bountyNFTs.map((bountyNFT) => (
                      <BountyNFTCard bountyNFT={bountyNFT} />
                    ))
                  ) : (
                    <div>No bounties yet!</div>
                  )}
                </div>

                <button
                  className="my-first-step"
                  onClick={() => {
                    setShowCoinflow(!showCoinflow);
                  }}
                >
                  Cash Out
                </button>

                {showCoinflow && <CoinflowOfframp />}
              </>
            ) : (
              <Button
                disabled={!currentWallet}
                disabledText={"Please connect a wallet"}
                onClick={mintProfileNFT}
                id="mint-profile-nft"
              >
                Mint Profile NFT
              </Button>
            )}
          </div>
        </>
      )}
    </DefaultLayout>
  );
};

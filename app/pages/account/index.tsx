import App from "@/src/pages/account";
import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useLancer } from "@/src/providers";
import dynamic from "next/dynamic";
import { DefaultLayout } from "@/src/components";
import Coinflow from "@/pages/account/coinflowOfframp";
import {
  BOUNTY_PROJECT_PARAMS,
  IS_MAINNET,
  PROFILE_PROJECT_PARAMS,
} from "@/src/constants";
import { WalletInfo } from "@/pages/account/WalletInfo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "@/src/utils/api";
import { BountyNFT, ProfileNFT } from "@/src/pages/account/account";
import { CurrentUser } from "@/src/types";
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
        <title>Lancer</title>
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

  const { currentUser, wallets, currentWallet } = useLancer();
  const [showCoinflow, setShowCoinflow] = useState(false);
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
    if (account && account.profileWalletId) {
      fetchProfileNFT();
      fetchBountyNFTs();
    }
  }, [account]);

  const mintProfileNFT = async () => {
    const result = await underdogClient.createNft({
      params: PROFILE_PROJECT_PARAMS,
      body: {
        name: `Profile NFT for ${account.githubLogin}`,
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
    await registerProfileNFT({
      walletPublicKey: currentWallet.publicKey.toString(),
    });
  };

  return (
    <DefaultLayout>
      {account && (
        <div className="account-page-wrapper">
          {/* {currentUser?.githubLogin && (
            <div>GitHub User: {currentUser.githubLogin}</div>
          )}
          <a href="/api/auth/logout">Logout</a>

          {wallets &&
            wallets.map((wallet) => (
              <WalletInfo wallet={wallet} key={wallet.publicKey.toString()} />
            ))}

          {!IS_MAINNET && (
            <a
              href="https://staging.coinflow.cash/faucet"
              target={"_blank"}
              rel="noreferrer"
            >
              USDC Faucet
            </a>
          )} */}
          <div>
            {profileNFT && (
              <ProfileNFT
                profileNFT={profileNFT}
                githubLogin={account.githubLogin}
                githubId={account.githubId}
              />
            )}
          </div>
          {bountyNFTs.length > 0 && (
            <div className="profile-bounty-list">
              <h2>Bounties</h2>
              {bountyNFTs.map((bountyNFT) => (
                <BountyNFT bountyNFT={bountyNFT} />
              ))}
            </div>
          )}
          {!account?.hasProfileNFT && (
            <button onClick={mintProfileNFT}>Mint Profile NFT</button>
          )}

          {/* <button
            onClick={() => {
              setShowCoinflow(!showCoinflow);
            }}
          >
            Cash Out
          </button> */}
          {showCoinflow && <Coinflow />}
        </div>
      )}
    </DefaultLayout>
  );
};

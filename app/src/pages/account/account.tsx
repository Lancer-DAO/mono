import {
  BOUNTY_PROJECT_PARAMS,
  IS_MAINNET,
  PROFILE_PROJECT_PARAMS,
  USDC_MINT,
} from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { PubKey } from "@/src/components";
import Coinflow from "./coinflowOfframp";
import { PageLayout } from "@/src/layouts";
import { WalletInfo } from "@/src/pages/account/components/WalletInfo";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";
import classnames from "classnames";
import {
  createUnderdogClient,
  useProject,
  Nft,
  NetworkEnum,
} from "@underdog-protocol/js";
import dayjs from "dayjs";
import { api } from "@/src/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { CurrentUser } from "@/src/types";
dayjs.extend(relativeTime);

const underdogClient = createUnderdogClient({});

export interface ProfileNFT {
  name: string;
  reputation: number;
  badges: string[];
  certifications: string[];
  image: string;
  lastUpdated?: dayjs.Dayjs;
}

export interface BountyNFT {
  name: string;
  reputation: number;
  tags: string[];
  image: string;
  completed?: dayjs.Dayjs;
  description: string;
  role: string;
}

const ProfileNFT = ({
  profileNFT,
  githubLogin,
  githubId,
}: {
  profileNFT: ProfileNFT;
  githubLogin: string;
  githubId: string;
}) => {
  return (
    <>
      <div className="profile-nft">
        {/* <img src={profileNFT.image} className="profile-picture" /> */}
        <img
          src={`https://avatars.githubusercontent.com/u/${
            githubId.split("|")[1]
          }?s=60&v=4`}
          className="profile-picture"
        />

        <div className="profile-nft-header">
          <h4>{githubLogin}</h4>
          <div>{profileNFT.reputation} Pts</div>
        </div>
        {profileNFT.badges?.length > 0 && (
          <div className="profile-section">
            <div className="divider"></div>
            <h4>Badges</h4>
            <div className="tag-list">
              {profileNFT.badges.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}
        {profileNFT.certifications?.length > 0 && (
          <div className="profile-section">
            <div className="divider"></div>

            <h4>Certificates</h4>
            <div className="tag-list">
              {profileNFT.certifications.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="divider"></div>

        <h4>Last Updated</h4>
        <div>{profileNFT.lastUpdated?.fromNow()}</div>
      </div>
    </>
  );
};

const BountyNFT = ({ bountyNFT }: { bountyNFT: BountyNFT }) => {
  return (
    <>
      <div className="bounty-nft">
        <img
          src={"/assets/images/Lancer Gradient No Background 1.png"}
          className="bounty-picture"
        />
        {/* <img src={bountyNFT.image} className="bounty-picture" /> */}

        <div className="bounty-nft-header">
          <div>
            <h4>{bountyNFT.name}</h4>
            <div className="bounty-nft-subheader">
              {bountyNFT.reputation} Pts | {bountyNFT.completed?.fromNow()} |{" "}
              {bountyNFT.role}
            </div>

            {bountyNFT.tags?.length > 0 && (
              <div className="tag-list">
                {bountyNFT.tags.map((badge) => (
                  <div className="tag-item" key={badge}>
                    {badge}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const FundBounty: React.FC = () => {
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
    <PageLayout>
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
    </PageLayout>
  );
};

export default FundBounty;

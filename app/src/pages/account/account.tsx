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

const ProfileNFT = ({ profileNFT }: { profileNFT: ProfileNFT }) => {
  return (
    <>
      <div className="profile-nft">
        <div className="profile-nft-header">
          <img src={profileNFT.image} className="profile-picture" />
          <div>
            <h4>{profileNFT.name}</h4>
            <div>{profileNFT.reputation} Reputation Points</div>
          </div>
        </div>
        {profileNFT.badges?.length > 0 && (
          <>
            <h4>Badges</h4>
            <div className="tag-list">
              {profileNFT.badges.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          </>
        )}
        {profileNFT.certifications?.length > 0 && (
          <>
            <h4>Certificates</h4>
            <div className="tag-list">
              {profileNFT.certifications.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          </>
        )}
        <h4>Last Updated</h4>
        <div>{profileNFT.lastUpdated?.toString()}</div>
      </div>
    </>
  );
};

const BountyNFT = ({ bountyNFT }: { bountyNFT: BountyNFT }) => {
  return (
    <>
      <div className="bounty-nft">
        <div className="profile-nft-header">
          <img src={bountyNFT.image} className="profile-picture" />
          <div>
            <h4>
              {bountyNFT.name} | {bountyNFT.role}
            </h4>
            <div>{bountyNFT.reputation} Reputation Points</div>
          </div>
        </div>
        {bountyNFT.tags?.length > 0 && (
          <>
            <h4>Tags</h4>
            <div className="tag-list">
              {bountyNFT.tags.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          </>
        )}
        <h4>Completed</h4>
        <div>{bountyNFT.completed?.toString()}</div>
      </div>
    </>
  );
};

const FundBounty: React.FC = () => {
  const { currentUser, wallets, currentWallet } = useLancer();
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();
  const [bountyNFTs, setBountyNFTs] = useState<BountyNFT[]>([]);

  const { mutateAsync: registerProfileNFT } =
    api.users.registerProfileNFT.useMutation();
  const fetchProfileNFT = async () => {
    const profileNFTHolder = currentUser.wallets.find(
      (wallet) => wallet.id === currentUser.profileWalletId
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
    const profileNFTHolder = currentUser.wallets.find(
      (wallet) => wallet.id === currentUser.profileWalletId
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
    setBountyNFTs(bountyNFTs);
  };
  useEffect(() => {
    if (currentUser && currentUser.profileWalletId) {
      fetchProfileNFT();
      fetchBountyNFTs();
    }
  }, [currentUser]);

  const mintProfileNFT = async () => {
    const result = await underdogClient.createNft({
      params: PROFILE_PROJECT_PARAMS,
      body: {
        name: `Profile NFT for ${currentUser.githubLogin}`,
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
    currentUser && (
      <PageLayout>
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
          {profileNFT && <ProfileNFT profileNFT={profileNFT} />}
          {bountyNFTs.length > 0 && (
            <>
              <h2>Bounties</h2>
              {bountyNFTs.map((bountyNFT) => (
                <BountyNFT bountyNFT={bountyNFT} />
              ))}
            </>
          )}
          {!currentUser?.hasProfileNFT && (
            <button onClick={mintProfileNFT}>Mint Profile NFT</button>
          )}

          <button
            onClick={() => {
              setShowCoinflow(!showCoinflow);
            }}
          >
            Cash Out
          </button>
          {showCoinflow && <Coinflow />}
        </div>
      </PageLayout>
    )
  );
};

export default FundBounty;

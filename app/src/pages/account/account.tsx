import {
  DEVNET_PROFILE_PROJECT_PARAMS,
  IS_MAINNET,
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
import { createUnderdogClient, useProject, Nft } from "@underdog-protocol/js";
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

const FundBounty: React.FC = () => {
  const { currentUser, wallets, currentWallet } = useLancer();
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();

  const { mutateAsync: registerProfileNFT } =
    api.users.registerProfileNFT.useMutation();
  const fetchNFT = async () => {
    const profileNFTHolder = currentUser.wallets.find(
      (wallet) => wallet.id === currentUser.profileWalletId
    );
    const nfts = await underdogClient.getNfts({
      params: DEVNET_PROFILE_PROJECT_PARAMS,
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
  useEffect(() => {
    if (currentUser && currentUser.hasProfileNFT) fetchNFT();
  }, [currentUser]);

  const mintProfileNFT = async () => {
    const result = await underdogClient.createNft({
      params: DEVNET_PROFILE_PROJECT_PARAMS,
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
    fetchNFT();
    registerProfileNFT({ walletPublicKey: currentWallet.publicKey.toString() });
  };

  return (
    currentUser && (
      <PageLayout>
        <div className="account-page-wrapper">
          {currentUser?.githubLogin && (
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
          )}
          {profileNFT && (
            <div>
              <img src={profileNFT.image} className="contributor-picture" />
              <div>Name: {profileNFT.name}</div>
              <div>Reputation: {profileNFT.reputation}</div>
              <div>
                Badges:{" "}
                {profileNFT.badges.map((badge) => (
                  <div className="tag-item" key={badge}>
                    {badge}
                  </div>
                ))}
              </div>
              <div>
                Certifications:{" "}
                {profileNFT.certifications.map((certification) => (
                  <div className="tag-item" key={certification}>
                    {certification}
                  </div>
                ))}
              </div>
              <div>Last Updated: {profileNFT.lastUpdated?.toString()}</div>
            </div>
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

import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useLancer } from "@/src/providers";
import dynamic from "next/dynamic";
import styles from "./style.module.css";
import Header from "@/src/components/organisms/Header";
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import {
  DefaultLayout,
  ProfileNFTCard,
  CoinflowOfframp,
  Button,
  BountyNFTCard,
  JoyrideWrapper,
  ApiKeyModal,
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
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
} from "@/src/constants/tutorials";
import { Key } from "react-feather";
import { Style_Script } from "@next/font/google";
dayjs.extend(relativeTime);

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

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

  const {
    currentUser,
    currentWallet,
    currentTutorialState,
    setCurrentTutorialState,
    isMobile,
  } = useLancer();
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [profileNFT, setProfileNFT] = useState<ProfileNFT>();
  const [bountyNFTs, setBountyNFTs] = useState<BountyNFT[]>([]);
  const { mutateAsync: getUser } = api.users.getUser.useMutation();
  const [account, setAccount] = useState<CurrentUser>();
  const [showModal, setShowModal] = useState(false);
  const { currentAPIKey } = useLancer();

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
    const result = await underdogClient.createNft({
      params: PROFILE_PROJECT_PARAMS,
      body: {
        name: `${account.githubLogin}`,
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
    const updatedUser = await registerProfileNFT({
      walletPublicKey: currentWallet.publicKey.toString(),
    });
    setAccount(updatedUser);
  };

  return (
    <div className={styles.cll}>

      <Header />

      <div className={styles.center}>
        <div className={styles.info}>
          {currentUser?.githubLogin && (
            <div className={styles.name}>{currentUser.githubLogin}</div>
          )}
          {useAnchorWallet() ? <div className={styles.con}>
            <div className={styles.sbal}>
              <p>Sol Balance : <span className={styles.white}>0 {/**dummy text*/}</span></p>
            </div>
            <div className={styles.sbal}>
              <p>USDC Balance : <span className={styles.white}>0 {/**dummy text*/}</span></p>
            </div>
          </div> : <div className={styles.noC}>Connect wallet to withdraw from your account</div>}</div>

        {useAnchorWallet() ? <div className={styles.after}>
          <div className={styles.walletbar}>
            BuxU...EXks {/**dummy text*/}
          </div>
          <div className={styles.verify} >Verify Wallet</div>
          <div className={styles.withdraw} ><img className={styles.down} src="https://media.discordapp.net/attachments/996247310080147507/1125477353276047541/Frame.png?width=22&height=23" />Withdraw</div>
        </div> : <WalletMultiButtonDynamic className={styles.connect} />}


      </div>
    </div>
  );
};

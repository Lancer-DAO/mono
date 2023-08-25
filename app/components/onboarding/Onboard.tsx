import { FC, useEffect, useState } from "react";
import { ProfileInfoView, SkillsetView, WelcomeView } from "./components";
import { IAsyncResult, User } from "@/types";
import { useUserWallet } from "@/src/providers";
import { useRouter } from "next/router";
import { createUnderdogClient } from "@underdog-protocol/js";
import { PROFILE_PROJECT_PARAMS } from "@/src/constants";
import dayjs from "dayjs";
import { api } from "@/src/utils";

const underdogClient = createUnderdogClient({});

export enum OnboardStep {
  Welcome,
  Skillset,
  Info,
}

const Onboard: FC = () => {
  const [formSection, setFormSection] = useState<OnboardStep>(
    OnboardStep.Welcome
  );
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: [],
    bio: "",
    linkedin: "",
    github: "",
    twitter: "",
    website: "",
  });
  const [account, setAccount] = useState<IAsyncResult<User>>({
    isLoading: true,
    loadingPrompt: "Welcome to Lancer",
  });
  const { currentUser, currentWallet } = useUserWallet();
  const { mutateAsync: registerProfileNFT } =
    api.users.registerProfileNFT.useMutation();

  const router = useRouter();

  const mintProfileNFT = async () => {
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

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const getUserAsync = async () => {
      try {
        setAccount({
          isLoading: true,
          loadingPrompt: "Setting up your profile...",
        });
        await mintProfileNFT();

        setAccount({
          isLoading: false,
          result: currentUser,
          error: null,
        });

        // show welcome screen for 2 more seconds
        // then show skillset view
        timeout = setTimeout(() => {
          setFormSection(OnboardStep.Skillset);
        }, 2000);
      } catch (e) {
        setAccount({ error: e });
      }
    };

    if (!!currentUser && !!currentWallet?.publicKey) {
      getUserAsync();
    } else {
      setAccount({
        isLoading: true,
        error: null,
        result: null,
        loadingPrompt: "Please connect your wallet to continue.",
      });
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [currentUser, router.isReady, currentWallet?.publicKey]);

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row md:justify-evenly mt-10">
      {formSection === OnboardStep.Welcome && <WelcomeView account={account} />}
      {formSection === OnboardStep.Skillset && (
        <SkillsetView
          setFormSection={setFormSection}
          profileData={profileData}
          setProfileData={setProfileData}
          account={account?.result}
        />
      )}
      {formSection === OnboardStep.Info && (
        <ProfileInfoView
          setFormSection={setFormSection}
          profileData={profileData}
          setProfileData={setProfileData}
        />
      )}
    </div>
  );
};

export default Onboard;

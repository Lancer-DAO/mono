import { FC, useEffect, useState } from "react";
import { ProfileInfoView, SkillsetView, WelcomeView } from "./components";
import { IAsyncResult, ProfileFormData, User } from "@/types";
import { useUserWallet } from "@/src/providers";
import { useRouter } from "next/router";
import { createUnderdogClient } from "@underdog-protocol/js";
import { PROFILE_PROJECT_PARAMS } from "@/src/constants";
import dayjs from "dayjs";
import { api } from "@/src/utils";
import toast from "react-hot-toast";

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
  const [profileData, setProfileData] = useState<ProfileFormData>({
    industry: null,
    displayName: "",
    email: "",
    company: "",
    position: "",
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
  const { mutateAsync: registerOnboardingInfo } =
    api.users.addOnboardingInformation.useMutation();

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
    api.users.registerProfileNFT.useQuery({
      walletPublicKey: currentWallet.publicKey.toString(),
    });
  };

  const handleUpdateProfile = async () => {
    const toastId = toast.loading("Finishing profile creation...");
    try {
      await registerOnboardingInfo({
        industryId: profileData.industry.id,
        name: profileData.displayName,
        company: profileData.company,
        position: profileData.position,
        bio: profileData.bio,
        linkedin: profileData.linkedin,
        twitter: profileData.twitter,
        github: profileData.github,
        website: profileData.website,
      });
      // await updateHasFinishedOnboarding(currentUser.id);
      toast.success("Profile created successfully!", { id: toastId });
    } catch (e) {
      console.log("error updating profile: ", e);
      toast.error("Error updating profile", { id: toastId });
    }
  };

  useEffect(() => {
    if (!currentUser?.name) return;
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

    if (!!currentWallet?.publicKey) {
      getUserAsync();
    } else {
      setAccount({
        isLoading: true,
        error: null,
        result: null,
        loadingPrompt: "Please connect your wallet to continue...",
      });
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [currentUser, router.isReady, currentWallet?.publicKey]);

  useEffect(() => {
    if (account?.result) {
      setProfileData({
        ...profileData,
        displayName: account?.result?.name,
        email: account?.result?.email,
      });
    }
  }, [account?.result]);

  // useEffect(() => {
  //   console.log("profile data: ", profileData);
  // }, [profileData]);

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
          account={account?.result}
          handleUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default Onboard;

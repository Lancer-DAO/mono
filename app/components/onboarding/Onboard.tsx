import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { ProfileInfoView, SkillsetView, WelcomeView } from "./components";
import { IAsyncResult, ProfileFormData, User } from "@/types";
import { useUserWallet } from "@/src/providers";
import { useRouter } from "next/router";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import { api } from "@/src/utils";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingBar } from "@/components";

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
  const [nftCreated, setNftCreated] = useState(false);
  const [walletRegistered, setWalletRegistered] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>("");

  const { currentUser, currentWallet } = useUserWallet();
  const {
    data: fetchedUser,
    isLoading: userLoading,
    isError: userError,
    refetch,
  } = api.users.getUser.useQuery(
    {
      id: currentUser?.id,
    },
    {
      enabled: !!currentUser,
    }
  );
  const { mutateAsync: registerOnboardingInfo } =
    api.users.addOnboardingInformation.useMutation();
  api.users.registerProfileNFT.useQuery(
    {
      walletPublicKey: currentWallet?.publicKey.toString(),
    },
    {
      enabled: !!currentWallet,
    }
  );
  const { isLoading: isVerifyingWallet } = api.users.verifyWallet.useQuery(
    {
      walletPublicKey: currentWallet?.publicKey.toString(),
    },
    {
      enabled: !!currentWallet && !!nftCreated && !!fetchedUser,
      onError: (e) => {
        setWalletRegistered(false);
        if (e.message === "Wallet is registered to another user") {
          toast.error("This wallet is already registered to another user", {
            id: "verify-wallet",
          });
          setWalletError(
            "This wallet is already registered to another user. Please connect a different wallet to continue."
          );
          return;
        } else {
          toast.error("Error verifying wallet", { id: "verify-wallet" });
          console.log("Error verifying wallet: ", e);
          setWalletError(e.message);
        }
      },
      onSuccess: () => {
        if (walletRegistered) return;
        setWalletRegistered(true);
        toast.success("Wallet verified!", { id: "verify-wallet" });
      },
    }
  );

  const router = useRouter();

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
      toast.success("Profile created successfully!", { id: toastId });
      router.push("/account");
    } catch (e) {
      console.log("error updating profile: ", e);
      toast.error("Error updating profile", { id: toastId });
    }
  };

  useEffect(() => {
    if (!!fetchedUser && !userLoading && !userError) {
      setProfileData({
        ...profileData,
        displayName: fetchedUser?.name,
        email: fetchedUser?.email,
      });
    }
  }, [fetchedUser, userLoading, userError]);

  return (
    <div className="w-full h-full my-32">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          key={`onboard-${formSection}`}
          className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row md:justify-evenly mt-10"
        >
          {isVerifyingWallet && !userLoading && (
            <LoadingBar title={"Registering your account"} />
          )}
          {userLoading && <LoadingBar title={null} />}
          {userError && (
            <div className="text-red-500">{`Error registering your account.`}</div>
          )}
          <WelcomeView
            account={fetchedUser}
            formSection={formSection}
            setFormSection={setFormSection}
            walletRegistered={walletRegistered}
            walletError={walletError}
            setWalletError={setWalletError}
            isVerifyingWallet={isVerifyingWallet}
          />
          <SkillsetView
            formSection={formSection}
            setFormSection={setFormSection}
            profileData={profileData}
            setProfileData={setProfileData}
            account={fetchedUser}
          />
          <ProfileInfoView
            formSection={formSection}
            setFormSection={setFormSection}
            profileData={profileData}
            setProfileData={setProfileData}
            account={fetchedUser}
            handleUpdateProfile={handleUpdateProfile}
          />
        </motion.div>
      </AnimatePresence>
      <div className="fixed bottom-0 left-0">
        <Image
          src="/assets/images/knight_left.png"
          width={386.25}
          height={360}
          alt="knight"
        />
      </div>
      <div className="fixed bottom-0 right-0">
        <Image
          src="/assets/images/knight_right.png"
          width={386.25}
          height={360}
          alt="knight"
        />
      </div>
    </div>
  );
};

export default Onboard;

import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { motion } from "framer-motion";
import { ProfileCreated } from "@/components";
import { User } from "@/types";
import { OnboardStep } from "../Onboard";
import { IS_CUSTODIAL, smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface Props {
  account: User;
  formSection: OnboardStep;
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
  walletRegistered: boolean;
  walletError: string;
  setWalletError: Dispatch<SetStateAction<string>>;
  isVerifyingWallet: boolean;
}

export const WelcomeView: FC<Props> = ({
  account,
  formSection,
  setFormSection,
  walletRegistered,
  walletError,
  setWalletError,
  isVerifyingWallet,
}) => {
  const { currentWallet } = useUserWallet();
  const { setVisible: showProviderModal } = useWalletModal();

  useEffect(() => {
    if (!currentWallet && !IS_CUSTODIAL) {
      showProviderModal(true);
    }
  }, [currentWallet, account]);

  useEffect(() => {
    setWalletError("");
  }, [currentWallet, account]);

  if (walletError !== "")
    return (
      <motion.div
        key={"error"}
        className={`${
          formSection === OnboardStep.Welcome ? "block" : "hidden"
        } flex flex-col items-center justify-center w-full h-full`}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-[750px] mx-auto h-full gap-5 px-5 mt-20">
          <p>{walletError}</p>
        </div>
      </motion.div>
    );

  return (
    account &&
    walletRegistered &&
    !isVerifyingWallet && (
      <motion.div
        key={"welcome"}
        className={`${
          formSection === OnboardStep.Welcome ? "block" : "hidden"
        } flex flex-col items-center justify-center w-full h-full`}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-[750px] mx-auto h-full gap-5 px-5">
          <div className="h-[390px]">
            <ProfileCreated width="w-96" height="w-96" />
          </div>
          <div className="text-lg text-center">
            You&apos;re one step away from connecting with the best clients &
            freelancers on the planet.
          </div>
          {account && (
            <motion.button
              {...smallClickAnimation}
              onClick={() => setFormSection(OnboardStep.Skillset)}
              className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
            mt-10 w-[100px] h-[50px] rounded-lg text-base"
            >
              NEXT
            </motion.button>
          )}
        </div>
      </motion.div>
    )
  );
};

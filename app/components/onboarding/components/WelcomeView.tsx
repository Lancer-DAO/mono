import { LoadingBar } from "@/components";
import { IAsyncResult, User } from "@/types";
import { FC } from "react";
import { OnboardStep } from "../Onboard";
import { motion } from "framer-motion";
import { enterAnimation } from "@/src/constants";

interface Props {
  account: IAsyncResult<User>;
  formSection: OnboardStep;
}

export const WelcomeView: FC<Props> = ({ account, formSection }) => {
  return (
    <motion.div
      {...enterAnimation}
      exit={{ opacity: 0 }}
      key={"welcome"}
      className={`${
        formSection === OnboardStep.Welcome ? "block" : "hidden"
      } flex flex-col items-center justify-center w-full h-full`}
    >
      {account.isLoading && <LoadingBar title={account.loadingPrompt} />}
      {account.error && (
        <div className="color-red">{account.error.message}</div>
      )}
      {account.result && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="text-4xl font-bold">Welcome to Lancer.</div>
          <div className="text-lg mt-4">
            You&apos;re one step away from connecting with the best clients &
            freelancers on the planet.
          </div>
        </div>
      )}
    </motion.div>
  );
};

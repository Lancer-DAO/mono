import { LoadingBar, LogoShield } from "@/components";
import { IAsyncResult, User } from "@/types";
import { Dispatch, FC, SetStateAction } from "react";
import { OnboardStep } from "../Onboard";
import { motion } from "framer-motion";
import { enterAnimation, smallClickAnimation } from "@/src/constants";

interface Props {
  account: IAsyncResult<User>;
  formSection: OnboardStep;
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
}

export const WelcomeView: FC<Props> = ({
  account,
  formSection,
  setFormSection,
}) => {
  return (
    <motion.div
      {...enterAnimation}
      exit={{ opacity: 0 }}
      key={"welcome"}
      className={`${
        formSection === OnboardStep.Welcome ? "block" : "hidden"
      } flex flex-col items-center justify-center w-full h-full`}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-[750px] mx-auto h-full gap-5 px-5">
        <div className="text-4xl font-bold text-center">Welcome to Lancer.</div>
        <div className="h-[320px]">
          <LogoShield width="w-80" height="w-80" />
        </div>
        <div className="text-lg text-center">
          You&apos;re one step away from connecting with the best clients &
          freelancers on the planet.
        </div>
        <div className="text-lg text-center">
          Velit duis excepteur esse sit dolore nulla. Proident minim cillum
          magna occaecat sint ipsum consectetur sit velit sit ullamco id non
          reprehenderit. Amet reprehenderit anim Lorem proident sunt laborum
          aute labore.
        </div>
        {account.isLoading && <LoadingBar title={null} />}
        {account.error && (
          <div className="text-red-500">{account.error.message}</div>
        )}
        {account.result && !account.isLoading && !account.error && (
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
  );
};

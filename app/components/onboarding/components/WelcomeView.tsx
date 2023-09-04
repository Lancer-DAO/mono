import {
  LoadingBar,
  LogoShield,
  ProfileCreated,
  QuestCompleted,
  QuestCreated,
} from "@/components";
import { IAsyncResult, User } from "@/types";
import { Dispatch, FC, SetStateAction } from "react";
import { OnboardStep } from "../Onboard";
import { motion } from "framer-motion";
import { enterAnimation, smallClickAnimation } from "@/src/constants";

interface Props {
  account: User;
  formSection: OnboardStep;
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
}

export const WelcomeView: FC<Props> = ({
  account,
  formSection,
  setFormSection,
}) => {
  return (
    account && (
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

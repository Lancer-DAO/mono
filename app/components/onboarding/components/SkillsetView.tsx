import { Dispatch, FC, SetStateAction } from "react";
import Image from "next/image";
import { OnboardStep } from "../Onboard";
import { User } from "@/types";
import { Skillset } from "./Skillset";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";

interface Props {
  formSection: OnboardStep;
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
  profileData: any;
  setProfileData: Dispatch<SetStateAction<any>>;
  account: User;
}

export const SkillsetView: FC<Props> = ({
  formSection,
  setFormSection,
  profileData,
  setProfileData,
  account,
}) => {
  return (
    <div
      className={`${
        formSection === OnboardStep.Skillset ? "block" : "hidden"
      } flex flex-col gap-5 items-center justify-center w-full h-full`}
    >
      <Image
        src={account?.picture}
        width={70}
        height={70}
        alt="profile picture"
        className="rounded-full overflow-hidden p-1 border-2 border-bgLancerSecondary"
      />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-center text-[42px]">Welcome, Lancer.</h1>
        <p className="text-xl uppercase text-center tracking-wider">
          Select your skillset
        </p>
      </div>
      <Skillset profileData={profileData} setProfileData={setProfileData} />
      <motion.button
        {...smallClickAnimation}
        onClick={() => setFormSection(OnboardStep.Info)}
        className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
        mt-10 w-[100px] h-[50px] rounded-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={profileData?.industry === null}
      >
        NEXT
      </motion.button>
    </div>
  );
};

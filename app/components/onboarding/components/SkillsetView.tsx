import { Dispatch, FC, SetStateAction } from "react";
import Image from "next/image";
import { OnboardStep } from "../Onboard";
import { IAsyncResult, User } from "@/types";
import { Industry } from "@prisma/client";
import { Skillset } from "./Skillset";

interface Props {
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
  profileData: any;
  setProfileData: Dispatch<SetStateAction<any>>;
  account: User;
}

export const SkillsetView: FC<Props> = ({
  setFormSection,
  profileData,
  setProfileData,
  account,
}) => {
  return (
    <div className="flex flex-col gap-5 items-center justify-center w-full h-full">
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
    </div>
  );
};

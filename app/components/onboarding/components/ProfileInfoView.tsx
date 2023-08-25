import { Dispatch, FC, SetStateAction } from "react";
import { OnboardStep } from "../Onboard";

interface Props {
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
  profileData: any;
  setProfileData: Dispatch<SetStateAction<any>>;
}

export const ProfileInfoView: FC<Props> = ({
  setFormSection,
  profileData,
  setProfileData,
}) => {
  return <div>ProfileInfoView!!</div>;
};

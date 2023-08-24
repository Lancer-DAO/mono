import { Dispatch, FC, SetStateAction } from "react";
import { OnboardStep } from "../Onboard";

interface Props {
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
}

export const SkillsetView: FC<Props> = ({
  setFormSection,
  formData,
  setFormData,
}) => {
  return <div>Skills select</div>;
};

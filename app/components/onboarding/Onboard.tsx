import { FC, useState } from "react";
import { ProfileInfoView, SkillsetView } from "./components";

export enum OnboardStep {
  Skillset,
  Info,
}

const Onboard: FC = () => {
  const [formSection, setFormSection] = useState<OnboardStep>(
    OnboardStep.Skillset
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    skills: [],
    bio: "",
    linkedin: "",
    github: "",
    twitter: "",
    website: "",
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row md:justify-evenly mt-10">
      {formSection === OnboardStep.Skillset && (
        <SkillsetView
          setFormSection={setFormSection}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {formSection === OnboardStep.Info && (
        <ProfileInfoView
          setFormSection={setFormSection}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

export default Onboard;

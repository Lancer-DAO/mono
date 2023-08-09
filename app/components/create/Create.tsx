import React, { useEffect, useState } from "react";
import {
  AddMediaForm,
  CreateBountyForm,
  FundBountyForm,
  PreviewCardBase,
} from "@/components";
import { PublicKey } from "@solana/web3.js";
import { FORM_SECTION, FormData } from "@/types/forms";
import { useUserWallet } from "@/src/providers";
import PreviewForm from "../organisms/PreviewForm";

export const Create = () => {
  const { provider } = useUserWallet();
  const [formSection, setFormSection] = useState<FORM_SECTION>("CREATE");
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    issuePrice: "",
    issueTitle: "",
    issueDescription: "",
    tags: [""],
    links: [""],
    media: [""],
    comment: "",
    organizationName: "",
    repositoryName: "",
    estimatedTime: "",
    isPrivate: true,
  });

  const createAccountPoll = (publicKey: PublicKey) => {
    provider.connection.onAccountChange(publicKey, (callback) => {
      setIsAccountCreated(true);
    });
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row md:justify-evenly mt-10">
      {/* quest info entry section */}
      <div
        className={`${formSection === "PREVIEW" ? "w-full" : "md:w-[515px]"}`}
      >
        {formSection === "CREATE" && (
          <CreateBountyForm
            setFormSection={setFormSection}
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
          />
        )}
        {formSection === "MEDIA" && (
          <AddMediaForm
            setFormSection={setFormSection}
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
          />
        )}
        {formSection === "PREVIEW" && (
          <PreviewForm
            setFormSection={setFormSection}
            formData={formData}
            setFormData={setFormData}
            createAccountPoll={createAccountPoll}
          />
        )}
        {formSection === "SUCCESS" && <div>Success</div>}
        {formSection === "FUND" && (
          <FundBountyForm isAccountCreated={isAccountCreated} />
        )}
      </div>
      {/* TODO: add preview section */}
      {formSection !== "PREVIEW" && (
        <div className="md:w-[515px] pt-10">
          <PreviewCardBase>Preview Card</PreviewCardBase>
        </div>
      )}
    </div>
  );
};

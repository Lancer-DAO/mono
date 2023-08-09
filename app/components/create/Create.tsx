import React, { useState } from "react";
import {
  AddMediaForm,
  CreateBountyForm,
  FundBountyForm,
  MarketingIcon,
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
    requirements: [""],
    links: [""],
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

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row md:justify-evenly mt-10">
      {/* quest info entry section */}
      <div
        className={`${formSection === "PREVIEW" ? "w-full" : "md:w-[515px]"}`}
      >
        {formSection === "CREATE" && (
          <CreateBountyForm
            setFormSection={setFormSection}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {formSection === "MEDIA" && (
          <AddMediaForm
            setFormSection={setFormSection}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {formSection === "PREVIEW" && (
          <PreviewForm
            setFormSection={setFormSection}
            formData={formData}
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
        <div className="md:w-[515px] border border-red-500">
          Quest preview here
          <MarketingIcon />
        </div>
      )}
    </div>
  );
};

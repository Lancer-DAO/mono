import React, { useState } from "react";
import { CreateBountyForm, FundBountyForm, MarketingIcon } from "@/components";
import { PublicKey } from "@solana/web3.js";
import { FORM_SECTION, FormData } from "@/types/forms";
import { useUserWallet } from "@/src/providers";

export const Create = () => {
  const { provider } = useUserWallet();
  const [formSection, setFormSection] = useState<FORM_SECTION>("CREATE");
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    category: "",
    organizationName: "",
    repositoryName: "",
    issueTitle: "",
    issuePrice: "",
    issueDescription: "",
    requirements: [],
    estimatedTime: "",
    isPrivate: true,
  });

  const createAccountPoll = (publicKey: PublicKey) => {
    provider.connection.onAccountChange(publicKey, (callback) => {
      setIsAccountCreated(true);
    });
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:justify-evenly mt-10">
      {/* quest info entry section */}
      <div className="md:w-[515px]">
        {formSection === "CREATE" && (
          <CreateBountyForm
            setFormSection={setFormSection}
            createAccountPoll={createAccountPoll}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {formSection === "MEDIA" && <div>Attach Media</div>}
        {formSection === "PREVIEW" && <div>Preview</div>}
        {formSection === "SUCCESS" && <div>Success</div>}
        {formSection === "FUND" && (
          <FundBountyForm isAccountCreated={isAccountCreated} />
        )}
      </div>
      {/* TODO: add preview section */}
      <div className="md:w-[515px] border border-red-500">
        Quest preview here
        <MarketingIcon />
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { BountyCard, PreviewCardBase } from "@/components";
import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";

import { FORM_SECTION, FormData } from "@/types/forms";
import { Mint } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";
import {
  AdditionalInfoForm,
  CreateBountyForm,
  FundBountyForm,
  PreviewForm,
  SuccessForm,
} from "./components";

interface Media {
  imageUrl: string;
  title: string;
  description: string;
}

export const Create = () => {
  const [formSection, setFormSection] = useState<FORM_SECTION>("CREATE");
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [mint, setMint] = useState<Mint>();
  const [formData, setFormData] = useState<FormData>({
    issuePrice: "",
    issueTitle: "",
    issueDescription: "",
    industryId: null,
    displineIds: [],
    tags: [""],
    links: [""],
    media: [],
    comment: "",
    organizationName: "",
    repositoryName: "",
    estimatedTime: "1",
    isPrivate: false,
  });

  const { provider } = useUserWallet();
  const { data: allMints } = api.mints.getMints.useQuery();

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

  // hard code USDC for now
  useEffect(() => {
    if (allMints) {
      // console.log("allMints", allMints);
      const mint = allMints.find((mint) => mint.ticker === "USDC");
      setMint(mint);
    }
  }, [allMints]);

  return (
    <div className="w-full max-w-[1200px] mx-auto flex md:justify-evenly mt-10">
      {/* quest info entry section */}
      <div
        className={`${
          formSection === "PREVIEW" || formSection === "FUND"
            ? "w-full"
            : "md:w-[515px]"
        }`}
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
          <AdditionalInfoForm
            setFormSection={setFormSection}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {formSection === "PREVIEW" && (
          <PreviewForm
            setFormSection={setFormSection}
            formData={formData}
            handleChange={handleChange}
            createAccountPoll={createAccountPoll}
            mint={mint}
          />
        )}
        {formSection === "FUND" && (
          <FundBountyForm
            isAccountCreated={isAccountCreated}
            formData={formData}
            setFormData={setFormData}
            setFormSection={setFormSection}
            mint={mint}
          />
        )}
        {formSection === "SUCCESS" && <SuccessForm />}
      </div>
      {/* preview section */}
      {formSection !== "PREVIEW" && formSection !== "FUND" && (
        <div className="md:w-[515px] pt-10">
          <PreviewCardBase>
            <BountyCard
              formData={formData}
              linked={formSection === "SUCCESS"}
            />
          </PreviewCardBase>
        </div>
      )}
    </div>
  );
};

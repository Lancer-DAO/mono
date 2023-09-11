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
  PreviewForm,
  SuccessForm,
} from "./components";
import { useMint } from "@/src/providers/mintProvider";

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
    requestQuote: false,
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
  const { allMints } = useMint();

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
    <div className="w-full max-w-[1200px] mx-auto flex md:justify-evenly mt-10 py-24">
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
        {formSection === "SUCCESS" && <SuccessForm />}
      </div>
      {/* preview section */}
      {formSection !== "PREVIEW" && (
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

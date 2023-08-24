import { BountyCard, PreviewCardBase } from "@/components";
import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";
import { IAsyncResult, Industry } from "@/types";
import { FORM_SECTION, FormData } from "@/types/forms";
import { Mint } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
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
  const { provider } = useUserWallet();
  const { mutateAsync: getMintsAPI } = api.mints.getMints.useMutation();
  const { mutateAsync: getAllIndustries } =
    api.industries.getAllIndustries.useMutation();
  const [industries, setIndustries] = useState<IAsyncResult<Industry[]>>({
    isLoading: true,
  });
  const [formSection, setFormSection] = useState<FORM_SECTION>("CREATE");
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [mint, setMint] = useState<Mint>();
  const [mints, setMints] = useState<Mint[]>([]);
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

  useEffect(() => {
    const getMints = async () => {
      const mints = await getMintsAPI();
      setMints(mints);
      // NOTE: hardcode mint to USDC for now
      setMint(
        mints.find(
          (mint) =>
            mint.publicKey === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        )
      );
    };
    getMints();
  }, []);

  useEffect(() => {
    const fetchCurrentIndustries = async () => {
      try {
        const industries = await getAllIndustries();
        setIndustries({ result: industries, isLoading: false });
      } catch (e) {
        console.log("error getting industries: ", e);
        setIndustries({ error: e, isLoading: false });
      }
    };
    fetchCurrentIndustries();
  }, []);

  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row md:justify-evenly mt-10">
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
            industries={industries}
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
            industries={industries?.result}
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
              allIndustries={industries?.result}
              linked={formSection === "SUCCESS"}
            />
          </PreviewCardBase>
        </div>
      )}
    </div>
  );
};

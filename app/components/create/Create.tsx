import React, { useEffect, useState } from "react";
import {
  CreateBountyForm,
  AddMediaForm,
  PreviewForm,
  FundBountyForm,
  SuccessForm,
  BountyCard,
  PreviewCardBase,
} from "@/components";
import { PublicKey } from "@solana/web3.js";
import { FORM_SECTION, FormData } from "@/types/forms";
import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";
import { IAsyncResult, Industry } from "@/types";
import { Mint } from "@prisma/client";

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
    industryIds: [],
    displineIds: [],
    tags: [""],
    links: [""],
    media: [""],
    comment: "",
    organizationName: "",
    repositoryName: "",
    estimatedTime: "1",
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

  useEffect(() => {
    const getMints = async () => {
      const mints = await getMintsAPI();
      setMints(mints);
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
          <AddMediaForm
            setFormSection={setFormSection}
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            mint={mint}
            setMint={setMint}
            mints={mints}
          />
        )}
        {formSection === "PREVIEW" && (
          <PreviewForm
            setFormSection={setFormSection}
            formData={formData}
            industries={industries?.result}
            setFormData={setFormData}
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

import { FC, useState } from "react";
import { Logo, MultiSelectDropdown } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import { Class } from "@/types";
import Level1Badge from "../@icons/Level1Badge";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";
import { Option } from "@/types";

export const CreateYourProfile: FC<{
  setPage: (page: number) => void;
  selectedClass: Class;
  name: string;
  setName: (name: string) => void;
  company: string;
  setCompany: (company: string) => void;
  description: string;
  setDescription: (companyDescription: string) => void;
  industry: Option;
  setIndustry: (industryName: Option) => void;
  industryOptions: Option[];
}> = ({
  setPage,
  selectedClass,
  name,
  setName,
  company,
  setCompany,
  description,
  setDescription,
  industry,
  setIndustry,
  industryOptions,
}) => {
  const { currentUser } = useUserWallet();
  const disabled =
    !name || (selectedClass === "Noble" && !company) || !description;
  return (
    <div className="w-[500px] px-10 lg:px-0 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center rounded-full bg-neutral-200 h-[32px] w-[32px]">
        <Logo width="27px" height="27px" />
      </div>
      <h1 className="font-bold text-neutral-600 mt-2">
        Now, create your Profile.
      </h1>
      <div className="text-sm text-neutral-500 w-[520px] mt-1">
        {` Give some love to your profile and earn the Level 1 badge to be able to
        ${selectedClass === "Noble" ? "post" : "view"} quests.`}
      </div>
      <div className="flex flex-col h-[550px] items-center justify-center">
        <div className="flex relative">
          <div className="relative h-[150px] w-[500px] z-0">
            <div className="absolute top-[-316px] left-[-192px]">
              <Level1Badge
                height="900px"
                width="900px"
                color={selectedClass === "Noble" ? "purple" : "green"}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white rounded-md p-8 mt-6 z-10 w-[500px]">
          <div className="relative flex items-center mb-7">
            {currentUser && (
              <Image
                src={currentUser.picture}
                width={32}
                height={32}
                className="rounded-full"
                alt="user profile picture"
              />
            )}
            <div className="mr-4 text-sm ml-4 w-[72px]">Name</div>
            <input
              type="text"
              className="placeholder:text-neutral-500 border bg-neutral-100 
            border-neutral-200 w-full py-2 px-4 rounded-md text-sm"
              name="issueTitle"
              placeholder="Sir Lance"
              id="issue-title-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="relative flex items-center ">
            <div
              className={`mr-4 text-sm ${
                selectedClass === "Noble" ? "w-[140px]" : "w-[134px]"
              }`}
            >
              {selectedClass === "Noble" ? "Company Name" : "Specialization"}
            </div>
            {selectedClass === "Noble" ? (
              <input
                type="text"
                className="placeholder:text-neutral-500 border bg-neutral-100 
            border-neutral-200 w-full py-2 px-4 rounded-md text-sm"
                name="issueTitle"
                placeholder="Company Name"
                id="issue-title-input"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                }}
              />
            ) : (
              <MultiSelectDropdown
                selected={[industry]}
                onChange={(selected) => {
                  const selectedOption = selected.find(
                    (option) => option.label !== industry.label
                  );
                  if (selectedOption) setIndustry(selectedOption);
                }}
                options={industryOptions}
                version="white"
              />
            )}
          </div>
          <div className="w-full h-[1px] bg-neutral-200 my-7" />

          <div className="w-full text-sm flex flex-col gap-1 mb-4">
            <p>{selectedClass === "Noble" ? "Company Description" : "Bio"}</p>
            <textarea
              className="placeholder:text-neutral-500 border bg-neutral-100 text-sm min-h-[100px] 
          border-neutral-200 w-full rounded-md px-3 py-2 resize-y mt-2"
              name="issueDescription"
              placeholder="Landing page for a HR Software focusing on SME’s. We have something outdated and we need a new website that shows new shiny features and reflect our Brand."
              id="issue-description-input"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <motion.button
        {...smallClickAnimation}
        className={`h-[50px] mt-5 w-full rounded-md text-base z-10 ${
          disabled
            ? "bg-error"
            : selectedClass === "Noble"
            ? "bg-noble100"
            : "bg-primary200"
        } text-white 
        } `}
        onClick={() => {
          setPage(2);
        }}
        disabled={disabled}
      >
        {disabled ? "Please complete all fields" : `Continue as ${name}`}
      </motion.button>
      <div className="flex gap-4 mt-8">
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
        <div className="bg-neutral-400 h-2 w-2 rounded-full" />
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
      </div>
    </div>
  );
};

import { FC } from "react";
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
      <div className="flex items-center justify-center rounded-full bg-neutral200 h-[32px] w-[32px]">
        <Logo width="27px" height="27px" />
      </div>
      <h1 className="font-bold text-neutral600 mt-2">
        Now, create your Profile.
      </h1>
      <div className="text-sm text-neutral500 w-[420px] text-center mx-auto mt-2">
        {` Give some love to your profile and earn the Level 1 badge to be able to
        ${selectedClass === "Noble" ? "post" : "apply to"} quests.`}
      </div>
      <div className="flex flex-col h-[430px] items-center justify-center">
        <div className="flex relative">
          <div className="relative h-[50px] w-[500px] z-0">
            <div className="absolute left-[140px] top-[-60px]">
              <Level1Badge
                height="222px"
                width="221px"
                color={selectedClass === "Noble" ? "purple" : "green"}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white rounded-md px-8 py-6 mt-6 z-10 w-[500px]">
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
              className="placeholder:text-neutral400 border bg-neutral100 
              border-neutral200 w-full py-2 px-4 rounded-md text-sm"
              name="issueTitle"
              placeholder="Your name"
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
                className="placeholder:text-neutral400 border bg-neutral100 
                border-neutral200 w-full py-2 px-4 rounded-md text-sm"
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
                extraClasses="w-[420px]"
              />
            )}
          </div>

          <div className="w-full text-sm flex flex-col gap-1 mt-4">
            <p>{selectedClass === "Noble" ? "Company Description" : "Bio"}</p>
            <textarea
              className="placeholder:text-neutral400 border bg-neutral100 text-sm min-h-[100px] 
              border-neutral200 w-full rounded-md px-3 py-2 mt-2 resize-none"
              name="issueDescription"
              placeholder={
                selectedClass === "Noble"
                  ? "Tell the world about your business"
                  : "Tell the world about yourself"
              }
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
        className={`h-[50px] w-full rounded-md text-base z-10 ${
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
      <div className="flex gap-4 mt-4">
        <button
          className="bg-neutral300 hover:bg-neutral400 h-3 w-3 rounded-full"
          onClick={() => setPage(0)}
        />
        <div className="bg-neutral500 h-3 w-3 rounded-full" />
        <button
          className="bg-neutral300 h-3 w-3 rounded-full disabled:cursor-not-allowed"
          disabled
        />
      </div>
    </div>
  );
};

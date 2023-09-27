import { FC, useState } from "react";
import { Logo } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import { Class } from "@/types";
import Level1Badge from "../@icons/Level1Badge";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";

const Highlight: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="w-fit p-2 rounded-full shadow-black-100 border border-neutral-200 inline-flex items-center cursor-pointer px-4">
      <span className="text-neutral-500 mr-2 text-sm">{label}</span>
      <div
        className={`flex items-center justify-center w-5 h-5 border rounded-full bg-neutral-200
            `}
      >
        <div className={`w-2 h-2  rounded-full bg-neutral-300`} />
      </div>
    </div>
  );
};

const NOBLE_HEIGHLIGHTS = [
  "Crush product backlog",
  "Access top talent",
  "Deliver seamlessly",
  "Pay Automatically",
];

const LANCER_HEIGHLIGHTS = [
  "Flexible work schedule",
  "Instant Payments",
  "Clear Expectations",
  "Variety of projects",
];

export const CreateYourProfile: FC<{ setPage: (page: number) => void }> = ({
  setPage,
}) => {
  const [selectedClass, setSelectedClass] = useState<Class>("Noble");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const { currentUser } = useUserWallet();
  return (
    <div className="w-[500px] px-10 lg:px-0 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center rounded-full bg-neutral-200 h-[32px] w-[32px]">
        <Logo width="27px" height="27px" />
      </div>
      <h1 className="font-bold text-neutral-600 mt-2">
        Now, create your Profile.
      </h1>
      <div className="text-sm text-neutral-500 w-[520px] mt-1">
        Give some love to your profile and earn the Level 1 badge to be able to
        post quests.
      </div>
      <div className="flex flex-col h-[550px] items-center justify-center">
        <div className="flex relative">
          <div className="relative h-[150px] w-[500px] z-0">
            <div className="absolute top-[-270px] left-[-192px]">
              <Level1Badge height="900px" width="900px" />
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
            <div className="mr-4 text-sm ml-4">Name</div>
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
            <div className="mr-4 text-sm w-[140px]">Company Name</div>
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
          </div>
          <div className="w-full h-[1px] bg-neutral-200 my-7" />

          <div className="w-full text-sm flex flex-col gap-1 mb-4">
            <p>Company Description</p>
            <textarea
              className="placeholder:text-neutral-500 border bg-neutral-100 text-sm min-h-[100px] 
          border-neutral-200 w-full rounded-md px-3 py-2 resize-y mt-2"
              name="issueDescription"
              placeholder="Landing page for a HR Software focusing on SME’s. We have something outdated and we need a new website that shows new shiny features and reflect our Brand."
              id="issue-description-input"
              value={companyDescription}
              onChange={(e) => {
                setCompanyDescription(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <motion.button
        {...smallClickAnimation}
        className={`h-[50px] mt-5 w-full rounded-md text-base z-10 ${
          selectedClass === "Noble" ? "bg-noble100" : "bg-primary200"
        } text-white 
        } `}
        onClick={() => {
          setPage(2);
        }}
      >
        {`Continue as ${selectedClass}`}
      </motion.button>
      <div className="flex gap-4 mt-8">
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
        <div className="bg-neutral-400 h-2 w-2 rounded-full" />
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
      </div>
    </div>
  );
};

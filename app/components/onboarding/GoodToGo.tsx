import { FC, useState } from "react";
import { Logo } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import { Class } from "@/types";
import Level1Badge from "../@icons/Level1Badge";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";
import DotsGrid from "../@icons/DotsGrid";
import { Cpu, Users, Wallet } from "lucide-react";

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

export const GoodToGo: FC<{ setPage: (page: number) => void }> = ({
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
      <h1 className="font-bold text-neutral-600 mt-2">You are good to go.</h1>
      <div className="text-sm text-neutral-500 mt-1">
        Create a quest on Lancer to see how the future works.
      </div>
      <div className="flex flex-col h-[550px] items-center justify-center">
        <div className="flex relative">
          <div className="relative h-[8px] w-[500px] z-0">
            <div className="absolute  left-[-96px] ">
              <DotsGrid width="692px" height="244px" />
            </div>
          </div>
        </div>
        <div className="flex flex-row bg-white rounded-md py-2 px-4 mt-6 z-10">
          <div className="flex flex-col justify-start items-start w-[270px] p-4">
            <div
              className={`text-[24px] ${
                selectedClass === "Noble" ? "text-noble100" : "text-primary200"
              }`}
            >
              <Users />
            </div>
            <div className="mt-4 text-neutral-600 text-sm ">
              Match with top experts.
            </div>
            <div className="text-sm mt-4 text-neutral-500">
              All talent on Lancer come pre-vetted. We match you with Lancers
              that are ready to build your vision.
            </div>
          </div>
          <div className="flex flex-col justify-start items-start w-[270px] p-4">
            <div
              className={`text-[24px] ${
                selectedClass === "Noble" ? "text-noble100" : "text-primary200"
              }`}
            >
              <Wallet />
            </div>
            <div className="mt-4 text-neutral-600 text-sm ">
              Work Seemlessly
            </div>
            <div className="text-sm mt-4 text-neutral-500">
              Pay safely by milestones and have a win-win process with
              contractors. We are here to make everything just work.
            </div>
          </div>
          <div className="flex flex-col justify-start items-start w-[270px] p-4">
            <div
              className={`text-[24px] ${
                selectedClass === "Noble" ? "text-noble100" : "text-primary200"
              }`}
            >
              <Cpu />
            </div>
            <div className="mt-4 text-neutral-600 text-sm ">
              Quotes are the way.
            </div>
            <div className="text-sm mt-4 text-neutral-500">
              Receive quotes directly from Lancers, helping you manage your
              budget and avoid scope creep.
            </div>
          </div>
        </div>
      </div>
      <motion.button
        {...smallClickAnimation}
        className={`h-[50px] mt-5 w-full rounded-md text-base ${
          selectedClass === "Noble" ? "bg-noble100" : "bg-primary200"
        } text-white 
        } `}
      >
        {`Start your Journey`}
      </motion.button>
      <div className="flex gap-4 mt-8">
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
        <div className="bg-neutral-400 h-2 w-2 rounded-full" />
      </div>
    </div>
  );
};

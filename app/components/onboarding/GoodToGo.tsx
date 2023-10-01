import { FC } from "react";
import { Logo } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import { Class } from "@/types";
import DotsGrid from "../@icons/DotsGrid";
import { Cpu, Users, Wallet } from "lucide-react";
import OnboardingFlowLancer from "../@icons/OnboardingFlowLancer";
import OnboardingFlowNoble from "../@icons/OnboardingFlowNoble";

export const GoodToGo: FC<{
  selectedClass: Class;
  updateProfile: () => void;
}> = ({ selectedClass, updateProfile }) => {
  return (
    <div className="w-[500px] px-10 lg:px-0 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center rounded-full bg-neutral-200 h-[32px] w-[32px]">
        <Logo width="27px" height="27px" />
      </div>
      <h1 className="font-bold text-neutral-600 mt-2">
        You&apos;re good to go.
      </h1>
      <div className="text-sm text-neutral-500 mt-1">
        {selectedClass === "Noble"
          ? "Create a quest on Lancer to see how the future works."
          : "Apply to a quest on Lancer to see how the future works."}
      </div>
      <div className="flex flex-col h-[430px] items-center justify-center">
        <div className="flex relative">
          <div className="relative h-[80px] w-[500px] z-0">
            <div className="absolute  left-[-96px] top-[-20px]">
              <DotsGrid
                width="692px"
                height="244px"
                version={selectedClass === "Noble" ? "purple" : "green"}
              />
            </div>

            <div className="absolute  left-[-390px] top-[-40px]">
              {selectedClass === "Noble" ? (
                <OnboardingFlowNoble width="1279" height="182" />
              ) : (
                <OnboardingFlowLancer width="1279" height="182" />
              )}
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
              {selectedClass === "Noble"
                ? "Match with top experts."
                : "Match with top clients."}
            </div>
            <div className="text-sm mt-4 text-neutral-500">
              {selectedClass === "Noble"
                ? "All talent on Lancer come pre-vetted. We match you with Lancers that are ready to build your vision."
                : "All clients on Lancer come pre-vetted. We match you with Nobles that are ready to utilize your talents."}
            </div>
          </div>
          <div className="h-full w-[1px] bg-neutral-200" />
          <div className="flex flex-col justify-start items-start w-[270px] p-4">
            <div
              className={`text-[24px] ${
                selectedClass === "Noble" ? "text-noble100" : "text-primary200"
              }`}
            >
              <Wallet />
            </div>
            <div className="mt-4 text-neutral-600 text-sm ">
              Work Seamlessly
            </div>
            <div className="text-sm mt-4 text-neutral-500">
              {selectedClass === "Noble"
                ? "Pay safely in milestones and have a win-win process with contractors. We are here to make everything just work."
                : "Get paid safely in milestones and have a win-win process with clients. We are here to make everything just work."}
            </div>
          </div>
          <div className="h-full w-[1px] bg-neutral-200" />

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
              {selectedClass === "Noble"
                ? "Receive quotes directly from Lancers, helping you manage your budget and avoid scope creep."
                : "Send quotes to Nobles before starting work, helping you plan your work and avoid scope creep."}
            </div>
          </div>
        </div>
      </div>
      <motion.button
        {...smallClickAnimation}
        className={`h-[50px]  w-full rounded-md text-base ${
          selectedClass === "Noble" ? "bg-noble100" : "bg-primary200"
        } text-white 
        } `}
        onClick={() => {
          updateProfile();
        }}
      >
        {`Start your Journey`}
      </motion.button>
      <div className="flex gap-4 mt-4">
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
        <div className="bg-neutral-200 h-2 w-2 rounded-full" />
        <div className="bg-neutral-400 h-2 w-2 rounded-full" />
      </div>
    </div>
  );
};

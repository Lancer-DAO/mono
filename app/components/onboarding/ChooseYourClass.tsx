import { FC } from "react";
import { Logo } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import NobleOnboardingHelmet from "../@icons/NobleOnboardingHelmet";
import LancerOnboardingHelmet from "../@icons/LancerOnboardingHelmet";
import LancerOnboardingEmblem from "../@icons/LancerOnboardingEmblem";
import NobleOnboardingEmblem from "../@icons/NobleOnboardingEmblem";
import { Class } from "@/types";
import useCursorInside from "@/src/hooks/useInsideAlerter";

const Highlight: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className="w-fit p-2 rounded-full shadow-black-100 border border-neutral-200 inline-flex items-center px-4">
      <div
        className={`flex items-center justify-center w-5 h-5 border rounded-full bg-neutral-200
        `}
      >
        <div className={`w-2 h-2 rounded-full bg-neutral-400`} />
      </div>
      <span className="text-neutral-500 ml-2 text-sm">{label}</span>
    </div>
  );
};

const NOBLE_HEIGHLIGHTS = [
  "Crush product backlog",
  "Access top talent",
  "Deliver seamlessly",
  "Pay automatically",
];

const LANCER_HEIGHLIGHTS = [
  "Flexible work schedule",
  "Instant payments",
  "Clear expectations",
  "Variety of projects",
];

export const ChooseYourClass: FC<{
  setPage: (page: number) => void;
  selectedClass: Class;
  setSelectedClass: (selectedClass: Class) => void;
}> = ({ setPage, selectedClass, setSelectedClass }) => {
  const [isInsideNoble, nobleRef] = useCursorInside();
  const [isInsideLancer, lancerRef] = useCursorInside();
  return (
    <div className="w-[500px] px-10 lg:px-0 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center rounded-full bg-neutral-200 h-[32px] w-[32px]">
        <Logo width="27px" height="27px" />
      </div>
      <h1 className="font-bold text-neutral-600 mt-2 z-10">
        Choose Your Class
      </h1>

      <div className="text-sm text-neutral-500  mt-1 z-10">
        Choose how your adventure begins.
      </div>
      <div className="flex flex-col h-[430px] items-center justify-center">
        <div className="flex relative">
          <div className="relative h-[500px] w-[500px] z-0">
            <div className="absolute h-[900px] w-[900px] top-[-200px] left-[-150px]">
              {selectedClass === "Noble" ? (
                <NobleOnboardingHelmet width="900px" height="900px" />
              ) : (
                <LancerOnboardingHelmet width="900px" height="900px" />
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center items-start h-[500px] min-w-[450px] z-10">
            <div className="flex flex-row gap-10 justify-center  items-center">
              <div
                className="hover:cursor-pointer "
                onClick={() => {
                  setSelectedClass("Noble");
                }}
                ref={nobleRef}
              >
                <NobleOnboardingEmblem
                  height={"140px"}
                  width={"106px"}
                  type={
                    selectedClass === "Noble" || isInsideNoble
                      ? "selected"
                      : "unselected"
                  }
                />
              </div>
              <div
                ref={lancerRef}
                className="hover:cursor-pointer "
                onClick={() => {
                  setSelectedClass("Lancer");
                }}
              >
                <LancerOnboardingEmblem
                  height={"140px"}
                  width={"106px"}
                  type={
                    selectedClass === "Lancer" || isInsideLancer
                      ? "selected"
                      : "unselected"
                  }
                />
              </div>
            </div>

            <div
              className={`h-[2px] w-16 mt-8 ${
                selectedClass === "Noble" ? "bg-noble100" : "bg-primary200"
              }`}
            />
            <div className="flex flex-row gap-1 mt-4">
              <div className="text-neutral-600 font-bold">
                {selectedClass === "Noble" ? "Client" : "Freelancer"}
              </div>
              <div className="text-neutral-500 font-bold">{`(${selectedClass})`}</div>
            </div>

            <div
              className={`mt-2 text-sm ${
                selectedClass === "Noble" ? "text-noble100" : "text-primary200"
              }`}
            >
              {selectedClass === "Noble"
                ? "I'm looking to hire talent on Lancer."
                : "I'm looking for work on Lancer."}
            </div>
            <div className="mt-4 text-sm">
              {selectedClass === "Noble"
                ? "The Noble is a disciplined and proud leader."
                : "The Lancer is a skilled and ambitious contributor."}
            </div>
            <div className="flex mt-4 gap-2 max-w-[450px] flex-wrap">
              {selectedClass === "Noble"
                ? NOBLE_HEIGHLIGHTS.map((highlight) => (
                    <Highlight key={highlight} label={highlight} />
                  ))
                : LANCER_HEIGHLIGHTS.map((highlight) => (
                    <Highlight key={highlight} label={highlight} />
                  ))}
            </div>
          </div>
        </div>
      </div>
      <motion.button
        {...smallClickAnimation}
        className={`h-[50px]  w-full rounded-md text-base z-10 ${
          selectedClass === "Noble" ? "bg-noble100" : "bg-primary200"
        } text-white 
        } `}
        onClick={() => {
          setPage(1);
        }}
      >
        {`Continue as ${selectedClass}`}
      </motion.button>
      <div className="flex gap-4 mt-4">
        <div className="bg-neutral-500 h-3 w-3 rounded-full" />
        <div className="bg-neutral-300 h-3 w-3 rounded-full" />
        <div className="bg-neutral-300 h-3 w-3 rounded-full" />
      </div>
    </div>
  );
};

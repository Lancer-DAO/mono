import { FC } from "react";
import CoinsIcon from "../@icons/Coins";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";

const FundCTA: FC = () => {
  return (
    <>
      <motion.button
        {...smallClickAnimation}
        className="h-12 w-fit px-4 border border-industryRedBorder/10 
      rounded-md flex items-center gap-2"
        onClick={() => {}}
      >
        <CoinsIcon className="fill-industryRed" />
        <p className="uppercase text-industryRed text-[9px] whitespace-nowrap">
          This quest is unfunded.
        </p>
      </motion.button>
      {/* TODO: add fund bounty modal */}
    </>
  );
};

export default FundCTA;

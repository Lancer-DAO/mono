import { FC, useState } from "react";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { FundBountyModal, Coins } from "@/components";

const FundCTA: FC = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <motion.button
        {...smallClickAnimation}
        className="h-12 w-fit px-4 border border-industryRedBorder/10 
        rounded-md flex items-center gap-2 bg-white"
        onClick={() => setShowModal(true)}
      >
        <Coins className="fill-industryRed" />
        <p className="uppercase text-industryRed text-[9px] whitespace-nowrap">
          This quest is unfunded.
        </p>
      </motion.button>
      {showModal && <FundBountyModal setShowModal={setShowModal} />}
    </>
  );
};

export default FundCTA;

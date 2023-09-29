import { Dispatch, FC, SetStateAction, useState } from "react";
import Image from "next/image";
import AlertCardModal from "./AlertCardModal";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";

interface Props {
  prompt: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setShowFundModal: Dispatch<SetStateAction<boolean>>;
  amount: number;
}

const DepositCTAModal: FC<Props> = ({
  prompt,
  setShowModal,
  setShowFundModal,
  amount,
}) => {
  return (
    <AlertCardModal setShowModal={setShowModal}>
      <div className="w-full p-4 pl-12 mt-4 flex flex-col justify-evenly bg-neutral100">
        <div className="relative w-full">
          <p className="title-text">Almost done!</p>
          <div className="absolute top-0 -left-8">
            <Image
              src="/assets/icons/rocket.svg"
              width={24}
              height={24}
              alt="icon"
            />
          </div>
        </div>
        <p className="text pt-1">{prompt}</p>
        <div className="w-full flex items-center justify-end gap-2 pt-4">
          <motion.button
            {...smallClickAnimation}
            className="bg-white border border-neutral300 h-9 w-fit px-4 py-2
            title-text rounded-md text-neutral60"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </motion.button>
          <motion.button
            {...smallClickAnimation}
            className="bg-secondary200 h-9 w-fit px-4 py-2
            title-text rounded-md text-white disabled:cursor-not-allowed disabled:opacity-80"
            onClick={() => setShowFundModal(true)}
          >
            {`Deposit $${amount} into escrow`}
          </motion.button>
        </div>
      </div>
    </AlertCardModal>
  );
};

export default DepositCTAModal;

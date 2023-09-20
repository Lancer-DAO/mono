import { FC, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { FundBountyModal } from "@/components";

interface Props {
  setShowModal: (show: boolean) => void;
}

const AlertCardModal: FC<Props> = ({ setShowModal }) => {
  const [showFundModal, setShowFundModal] = useState(false);

  const depositAmount = () => {
    return 1;
  };

  return (
    <>
      <motion.div
        key="image-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
        className="absolute left-0 top-0 backdrop-blur-sm z-50 w-full h-full bg-black/50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-1/2 top-5 transform 
          -translate-x-1/2 overflow-x-hidden overflow-y-auto
          bg-bgLancer rounded-xl w-[90%] max-h-[90vh]`}
        >
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
            <p className="text pt-1">{`Now that you shortlisted some solid candidates, we need you to commit and deposit into an escrow 5% of the highest quote you received, which equates to $${depositAmount()}.`}</p>
            <p className="text pt-1">
              This unlocks the ability to chat with your shortlisted applicants.
              Once you decide which candidate you want to work with, we will ask
              you to deposit 100% of the funds into escrow to kick things off.
            </p>
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
                {`Deposit $${depositAmount()} into escrow`}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      {showFundModal && (
        <FundBountyModal setShowModal={setShowModal} amount={depositAmount()} />
      )}
    </>
  );
};

export default AlertCardModal;

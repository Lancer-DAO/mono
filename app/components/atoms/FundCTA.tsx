import { Dispatch, FC, SetStateAction, useState } from "react";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { FundBountyModal, Coins } from "@/components";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyState } from "@/types";

interface Props {
  setIsFunded?: Dispatch<SetStateAction<boolean>>;
}

const FundCTA: FC<Props> = ({ setIsFunded }) => {
  const [showModal, setShowModal] = useState(false);
  const { currentBounty } = useBounty();
  return (
    <>
      {currentBounty?.isCreator &&
      currentBounty?.state !== BountyState.CANCELED ? (
        <motion.button
          {...smallClickAnimation}
          className="animate-pulse h-8 w-fit px-4 border border-industryRedBorder/10 
          rounded-md flex items-center gap-2 bg-white"
          onClick={() => setShowModal(true)}
        >
          <Coins className="fill-industryRed" />
          <p className="uppercase text-industryRed text-[9px] whitespace-nowrap">
            This quest is unfunded.
          </p>
        </motion.button>
      ) : (
        <div
          className="h-8 w-fit px-4 border border-industryRedBorder/10 
          rounded-md flex items-center gap-2 bg-white"
        >
          <Coins className="fill-industryRed" />
          <p className="uppercase text-industryRed text-[9px] whitespace-nowrap">
            This quest is unfunded.
          </p>
        </div>
      )}

      {showModal && (
        <FundBountyModal
          setIsFunded={setIsFunded}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
};

export default FundCTA;

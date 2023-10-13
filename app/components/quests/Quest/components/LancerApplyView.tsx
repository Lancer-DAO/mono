import { Dispatch, FC, SetStateAction } from "react";
import Image from "next/image";
import { useUserWallet } from "@/src/providers";
import { QuestActionView, useBounty } from "@/src/providers/bountyProvider";
import { motion } from "framer-motion";
import ActionsCardBanner from "./ActionsCardBanner";
import AlertCards from "./AlertCards";
import { smallClickAnimation } from "@/src/constants";

interface Props {
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  hasApplied: boolean;
  onClick: () => Promise<void>;
}

const LancerApplyView: FC<Props> = ({ hasApplied, onClick }) => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col h-full">
      <ActionsCardBanner
        title={`Conversation with ${currentBounty.creator.user.name}`}
      >
        {!hasApplied && (
          <motion.button
            {...smallClickAnimation}
            className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text 
            rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={onClick}
          >
            One-Click Apply
          </motion.button>
        )}
      </ActionsCardBanner>
      <AlertCards />
      <Image
        src="/assets/images/messaging_preview.png"
        width={2440}
        height={2328}
        alt="message preview"
        className="opacity-60"
      />
      <Image
        src="/assets/images/messaging_footer_preview.png"
        width={2440}
        height={276}
        alt="message preview"
        className="opacity-60"
      />
    </div>
  );
};

export default LancerApplyView;

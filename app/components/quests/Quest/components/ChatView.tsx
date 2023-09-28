import { BountyUserType } from "@/prisma/queries/bounty";
import { smallClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyState } from "@/types";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import { QuestActionView } from "./QuestActions";

interface Props {
  selectedSubmitter: BountyUserType | null;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const ChatView: FC<Props> = ({ selectedSubmitter, setCurrentActionView }) => {
  const { currentBounty } = useBounty();
  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Conversation with ${
          currentBounty.isCreator
            ? currentBounty.state === BountyState.ACCEPTING_APPLICATIONS
              ? selectedSubmitter.user.name
              : currentBounty.approvedSubmitters[0].user.name
            : currentBounty.creator.user.name
        } `}
      >
        {currentBounty.isCreator && (
          <motion.button
            onClick={() => {
              if (currentBounty.isCreator) {
                setCurrentActionView(QuestActionView.ViewApplicants);
              } else {
                setCurrentActionView(QuestActionView.SubmitApplication);
              }
            }}
            {...smallClickAnimation}
          >
            <X height={24} width={24} className="text-white" />
          </motion.button>
        )}
        {currentBounty.isApprovedSubmitter && (
          <motion.button
            {...smallClickAnimation}
            className="bg-secondary200 text-white title-text px-4 py-2 rounded-md"
            onClick={() => setCurrentActionView(QuestActionView.SubmitUpdate)}
          >
            Submit Update
          </motion.button>
        )}
      </ActionsCardBanner>
    </div>
  );
};

export default ChatView;

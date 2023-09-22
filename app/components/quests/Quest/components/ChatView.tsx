import { Dispatch, FC, SetStateAction } from "react";
import { motion } from "framer-motion";
import { BountyUserType } from "@/prisma/queries/bounty";
import ActionsCardBanner from "./ActionsCardBanner";
import { useBounty } from "@/src/providers/bountyProvider";
import { smallClickAnimation } from "@/src/constants";
import { X } from "lucide-react";
import { QuestActionView } from "./QuestActions";
import { BountyState } from "@/types";

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
                setCurrentActionView(QuestActionView.Apply);
              }
            }}
            {...smallClickAnimation}
          >
            <X height={24} width={24} className="text-white" />
          </motion.button>
        )}
        {currentBounty.isCurrentSubmitter && (
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

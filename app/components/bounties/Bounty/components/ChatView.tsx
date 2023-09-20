import { Dispatch, FC, SetStateAction } from "react";
import { motion } from "framer-motion";
import { BountyUserType } from "@/prisma/queries/bounty";
import ActionsCardBanner from "./ActionsCardBanner";
import { useBounty } from "@/src/providers/bountyProvider";
import { smallClickAnimation } from "@/src/constants";
import { X } from "lucide-react";
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
            ? selectedSubmitter.user.name
            : currentBounty.creator.user.name
        } `}
      >
        {currentBounty.isCreator ? (
          <motion.button
            onClick={() => {
              setCurrentActionView(QuestActionView.ViewApplicants);
            }}
            {...smallClickAnimation}
          >
            <X height={24} width={24} className="text-white" />
          </motion.button>
        ) : null}
      </ActionsCardBanner>
    </div>
  );
};

export default ChatView;

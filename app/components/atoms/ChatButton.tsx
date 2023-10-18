import { FC } from "react";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import { QuestActionView, useBounty } from "@/src/providers/bountyProvider";

interface Props {
  disabled?: boolean;
}
const ChatButton: FC<Props> = ({ disabled = false }) => {
  const { setCurrentActionView } = useBounty();
  return (
    <motion.button
      {...smallClickAnimation}
      disabled={disabled}
      onClick={() => {
        setCurrentActionView(QuestActionView.Chat);
      }}
      className="bg-white border border-neutral200 px-4 py-2 rounded-md flex items-center gap-2"
    >
      <p className="text-neutral600 title-text">Chat</p>
      {/* <svg
        width="6"
        height="6"
        viewBox="0 0 8 8"
        fill="none"
        className="animate-pulse"
      >
        <circle cx="4" cy="4" r="4" fill="#10966D" />
      </svg> */}
    </motion.button>
  );
};

export default ChatButton;

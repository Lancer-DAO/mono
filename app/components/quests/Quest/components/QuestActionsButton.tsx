import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";

interface QuestActionsButtonProps {
  type: "green" | "red" | "neutral";
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  extraClasses?: string;
  isLoading?: boolean;
}

export const QuestActionsButton: React.FC<QuestActionsButtonProps> = ({
  type,
  text,
  onClick,
  disabled = false,
  extraClasses,
  isLoading = false,
}) => (
  <motion.button
    {...smallClickAnimation}
    disabled={disabled}
    className={`flex justify-center items-center disabled:opacity-80 
    disabled:cursor-not-allowed rounded-md 
    ${type === "green" && "bg-primary200 text-white font-bold"}
    ${type === "neutral" && "bg-neutral100 border-neutral200 text-neutral600"}
    ${type === "red" && "bg-primary300 text-white"}
    border py-2 px-4 text-textPrimary ${extraClasses}`}
    onClick={onClick}
  >
    {isLoading ? "Loading..." : text}
  </motion.button>
);

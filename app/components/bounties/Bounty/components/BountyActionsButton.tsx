import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";

interface BountyActionsButtonProps {
  type: "green" | "red" | "neutral";
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const BountyActionsButton: React.FC<BountyActionsButtonProps> = ({
  type,
  text,
  onClick,
  disabled = false,
}) => (
  <motion.button
    {...smallClickAnimation}
    disabled={disabled}
    className={`flex justify-center items-center disabled:opacity-80 
    disabled:cursor-not-allowed rounded-lg 
    ${type === "green" && "bg-primaryBtn border-primaryBtnBorder"}
    ${type === "neutral" && "bg-neutralBtn border-neutralBtnBorder"}
    ${type === "red" && "bg-secondaryBtn border-secondaryBtnBorder"}
    border h-[50px] px-3 text-textPrimary`}
    onClick={onClick}
  >
    {text}
  </motion.button>
);

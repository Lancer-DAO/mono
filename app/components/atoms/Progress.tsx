import { motion } from "framer-motion";
import { FC } from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-fullbg-bgLancerSecondary/[8%] w-full h-4 rounded-full overflow-hidden border border-black/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="h-full bg-[#77CF6D] transition-all duration-300"
      />
    </div>
  );
};

export default ProgressBar;

import { FC, ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  setShowModal: (show: boolean) => void;
  children: ReactNode;
}

const AlertCardModal: FC<Props> = ({ setShowModal, children }) => {
  return (
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
        {children}
      </div>
    </motion.div>
  );
};

export default AlertCardModal;

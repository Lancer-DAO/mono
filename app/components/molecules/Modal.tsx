import {
  FC,
  ReactNode,
  HTMLAttributes,
  Dispatch,
  SetStateAction,
  useRef,
} from "react";
import { useOutsideAlerter } from "@/src/hooks";
import { Close } from "@/components";
import { motion } from "framer-motion";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}
const Modal: FC<Props> = (props: Props) => {
  const { setShowModal, children, className, ...componentProps } = props;

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setShowModal(false));

  // stop page scroll (when modal or menu open)
  // useEffect(() => {
  //   if (showModal) document.body.style.overflow = "hidden";
  //   else document.body.style.overflow = "auto";
  // }, [showModal, setShowModal]);

  return (
    <motion.div
      key="image-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.2 }}
      className="fixed inset-0 backdrop-blur-sm z-50 w-screen h-screen bg-black/30"
      onClick={componentProps.onClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute left-1/2 top-1/2 transform 
        -translate-y-1/2 -translate-x-1/2 overflow-x-hidden overflow-y-auto
        bg-bgLancer rounded-xl w-[90%] p-5 max-h-screen
        lg:w-[100vh] xl:w-[120vh] 3xl:w-[70vh] ${className}`}
        ref={wrapperRef}
      >
        <div
          className="fixed top-5 right-5 cursor-pointer"
          onClick={() => setShowModal(false)}
        >
          <Close className="fill-black w-4 h-4" />
        </div>
        {children}
      </div>
    </motion.div>
  );
};

export default Modal;

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
    <div
      key="image-modal"
      className="fixed inset-0 backdrop-blur-sm z-50 w-screen h-screen
      bg-bgLancer border border-primaryBtnBorder"
      onClick={componentProps.onClick}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`md:bg-opacity-90 absolute left-1/2 top-1/2 transform 
        -translate-y-1/2 -translate-x-1/2 overflow-clip
        bg-main bg-cover rounded-md w-[90%] p-4
        lg:w-[100vh] xl:w-[120vh] 3xl:w-[70vh] ${className}`}
        ref={wrapperRef}
      >
        <div
          className="fixed top-5 right-5 cursor-pointer"
          onClick={() => setShowModal(false)}
        >
          <Close />
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

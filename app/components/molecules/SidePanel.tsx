import React, { FC, useState, Dispatch, SetStateAction, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { enterAnimation, smallClickAnimation } from "@/constants";
import { useOutsideAlerter } from "@/hooks";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SidePanel: FC<Props> = ({ open, setOpen }) => {
  const [numCloses, setNumCloses] = useState(0);

  const ref = useRef(null);
  useOutsideAlerter(ref, () => setOpen(false));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black backdrop-blur-md transition duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            onClick={() => {
              setOpen(false);
              setNumCloses(numCloses + 1);
            }}
          />
          <motion.div
            className="flex items-start overflow-x-hidden fixed inset-y-0 right-0
        z-50 w-[400px] h-full transform"
            transition={{ ease: "easeInOut", duration: 0.3 }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            ref={ref}
          >
            <div
              className={`text-primary bg-white flex flex-col w-full h-full
          py-4 px-6 shadow-2xl`}
            >
              <div className="relative flex justify-center">
                header
                <div
                  className="absolute top-1/2 -translate-y-1/2 p-2 right-0"
                  onClick={() => {
                    setOpen(false);
                    setNumCloses(numCloses + 1);
                  }}
                >
                  {/* close menu icon */}
                  <svg
                    className="fill-black"
                    width="14"
                    height="14"
                    viewBox="0 0 14 15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.76256 7.5L0.256282 1.60041L1.49372 0.274588L7 6.17418L12.5063 0.274588L13.7437 1.60041L8.23744 7.5L13.7437 13.3996L12.5063 14.7254L7 8.82582L1.49372 14.7254L0.256282 13.3996L5.76256 7.5Z"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.256282 0.274587C0.59799 -0.0915292 1.15201 -0.091529 1.49372 0.274588L7 6.17418L12.5063 0.274588C12.848 -0.091529 13.402 -0.0915292 13.7437 0.274587C14.0854 0.640704 14.0854 1.2343 13.7437 1.60041L8.23744 7.5L13.7437 13.3996C14.0854 13.7657 14.0854 14.3593 13.7437 14.7254C13.402 15.0915 12.848 15.0915 12.5063 14.7254L7 8.82582L1.49372 14.7254C1.15201 15.0915 0.59799 15.0915 0.256282 14.7254C-0.0854273 14.3593 -0.0854271 13.7657 0.256282 13.3996L5.76256 7.5L0.256282 1.60041C-0.0854271 1.2343 -0.0854273 0.640704 0.256282 0.274587Z"
                    />
                  </svg>
                </div>
              </div>
              {open && (
                <motion.div
                  {...enterAnimation}
                  className="mt-4 flex flex-col items-center gap-3"
                >
                  testing
                </motion.div>
              )}
              <div />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;

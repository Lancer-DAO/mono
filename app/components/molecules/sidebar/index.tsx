import React, { FC, useState, Dispatch, SetStateAction, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { enterAnimation, smallClickAnimation } from "@/constants";
import { useOutsideAlerter } from "@/hooks";
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import { useUserWallet } from "@/src/providers";
import ChannelList from "@sendbird/uikit-react/ChannelList";
import InviteUsers from "@sendbird/uikit-react/CreateChannel/components/InviteUsers";

import CreateChannelUI from "@sendbird/uikit-react/CreateChannel/components/CreateChannelUI";

import Channel from "@sendbird/uikit-react/Channel";
import { CreateChannelProvider } from "@sendbird/uikit-react/CreateChannel/context";

import "@sendbird/uikit-react/dist/index.css";
import List from "./messaging/list";
import Messaging from "./messaging";
import { useChat } from "@/src/providers/chatProvider";

const SidePanel: FC = () => {
  const { currentUser } = useUserWallet();
  const { isChatOpen, setIsChatOpen } = useChat();

  const ref = useRef(null);
  // useOutsideAlerter(ref, () => setOpen(false));

  const handleOpenClose = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <AnimatePresence mode="wait">
      <>
        {isChatOpen && (
          <motion.div
            className="fixed inset-0 bg-black backdrop-blur-md transition duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.5 }}
            key="backdrop"
            onClick={handleOpenClose}
          />
        )}
        <motion.div
          className="flex items-start overflow-x-hidden fixed 
          inset-y-0 right-0 z-50 w-[35rem] h-full transform rounded-l-lg"
          initial={{ x: "91%" }}
          animate={{ x: isChatOpen ? "0" : "91%" }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
          key="panel"
          ref={ref}
        >
          <div className="flex w-full h-full">
            <div
              className="w-14 inset-y-0 cursor-pointer flex-shrink-0"
              onClick={handleOpenClose}
            >
              <div
                className={`w-full h-full bg-primaryBtn 
                rounded-l-3xl pt-6 flex justify-center`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 84 54"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    isChatOpen ? "rotate-180" : "rotate-0"
                  } transform transition-transform ease-in-out `}
                >
                  <path
                    d="M40.5 27C40.5 27.517 40.767 27.998 41.205 28.272L81.205 53.2721C81.452 53.4271 81.727 53.5 81.998 53.5C82.498 53.5 82.987 53.25 83.271 52.795C83.71 52.092 83.497 51.167 82.794 50.728L44.83 27L82.795 3.27205C83.498 2.83305 83.711 1.90805 83.272 1.20505C82.833 0.502049 81.907 0.289049 81.205 0.728049L41.205 25.7281C40.767 26.0021 40.5 26.483 40.5 27Z"
                    fill="black"
                  />
                  <path
                    d="M1.205 28.272L41.205 53.2721C41.452 53.4271 41.727 53.5 41.998 53.5C42.498 53.5 42.987 53.25 43.271 52.795C43.71 52.092 43.497 51.167 42.794 50.728L4.83 27L42.795 3.27205C43.498 2.83305 43.711 1.90805 43.272 1.20505C42.833 0.502049 41.908 0.289049 41.205 0.728049L1.205 25.7281C0.767 26.0021 0.5 26.483 0.5 27C0.5 27.517 0.767 27.998 1.205 28.272Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`text-primary bg-white flex flex-col h-full shadow-2xl flex-grow overflow-hidden`}
            >
              <div className="w-full flex p-4 pt-6 text-center">
                <div className="flex-grow h-10 rounded text-xl font-bold uppercase">
                  YOUR INBOX
                </div>
              </div>
              <Messaging />
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default SidePanel;

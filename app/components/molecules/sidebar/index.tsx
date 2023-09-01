import React, { FC, useState, Dispatch, SetStateAction, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { enterAnimation, smallClickAnimation } from "@/constants";
import { useOutsideAlerter } from "@/hooks";
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import { useUserWallet } from "@/src/providers";
import ChannelList from "@sendbird/uikit-react/ChannelList";
import InviteUsers from "@sendbird/uikit-react/CreateChannel/components/InviteUsers";

import {
  useChannelListContext,
  ChannelListProvider,
} from "@sendbird/uikit-react/ChannelList/context";
import CreateChannelUI from "@sendbird/uikit-react/CreateChannel/components/CreateChannelUI";

import Channel from "@sendbird/uikit-react/Channel";
import { CreateChannelProvider } from "@sendbird/uikit-react/CreateChannel/context";

import "@sendbird/uikit-react/dist/index.css";
import List from "./messaging/list";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SidePanel: FC<Props> = ({ open, setOpen }) => {
  const { currentUser } = useUserWallet();

  const [numCloses, setNumCloses] = useState(0);
  const [channel, setChannel] = useState<any | null>();

  const back = () => {
    setChannel(null);
  };

  const ref = useRef(null);
  // useOutsideAlerter(ref, () => setOpen(false));

  const close = () => {
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black backdrop-blur-md transition duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.5 }}
            // onClick={() => {
            //   setOpen(false);
            //   setNumCloses(numCloses + 1);
            // }}
          />
          <motion.div
            className="flex items-start overflow-x-hidden fixed inset-y-0 right-0 z-50 w-80 h-full transform"
            transition={{ ease: "easeInOut", duration: 0.3 }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            ref={ref}
          >
            <div
              className={`text-primary bg-white flex flex-col h-full shadow-2xl w-full`}
            >
              <div className="w-full flex p-2">
                {/* <div className="w-10 h-10 rounded bg-green-200 p-1 mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-full h-full"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                </div> */}

                <button className="flex-grow h-10 rounded bg-green-200 uppercase">
                  messages
                </button>

                <button
                  className="w-10 bg-green-200 h-10 ml-1 p-1.5"
                  onClick={close}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z"></path>
                  </svg>
                </button>
              </div>

              <div className="h-full">
                {currentUser && (
                  <SendbirdProvider
                    appId={"54A96D9A-1DEA-4962-9F4E-9899BAE7011D"}
                    userId={String(currentUser?.id)}
                    nickname={currentUser?.name}
                    profileUrl={currentUser?.picture}
                  >
                    {!channel ? (
                      // <ChannelList
                      //   // @ts-ignore
                      //   onChannelSelect={(channel) => {
                      //     if (channel && channel.url) {
                      //       // compare to prevChannel, if same dont set
                      //       if (channel && channel.url) {
                      //         // setChannel(channel);
                      //       }
                      //     }
                      //   }}
                      //   className="w-full m-0"
                      //   renderChannelPreview={({ channel }) => {
                      //     console.log("channel", channel);

                      //     // filter channel.members, if there are only 2 members, then it's a DM
                      //     // filter by current user and and return the other user

                      //     // members: { nickname: string, userId: string, plainProfileUrl: string }[]

                      //     const meta =
                      //       channel.members.length === 2
                      //         ? channel.members.filter(
                      //             (member) =>
                      //               member.userId !== String(currentUser?.id)
                      //           )[0]
                      //         : null;

                      //     console.log("meta", meta);

                      //     // what can the type of meta be?
                      //     // { nickname: string, userId: string, plainProfileUrl: string }

                      //     return (
                      //       <div
                      //         className="w-full flex hover:bg-slate-100 items-center cursor-pointer gap-x-2 h-20 px-3 border-b border-neutral-300"
                      //         onClick={() => {
                      //           setChannel(channel);
                      //         }}
                      //       >
                      //         <img
                      //           src={
                      //             meta
                      //               ? meta.plainProfileUrl
                      //               : channel.creator.plainProfileUrl
                      //           }
                      //           alt=""
                      //           className="w-10 h-10 rounded-full"
                      //         />

                      //         <div className="w-full">
                      //           <div>{meta ? meta.nickname : channel.name}</div>
                      //           <div className="truncate">
                      //             {channel.lastMessage
                      //               ? channel.lastMessage.message
                      //               : ""}
                      //           </div>
                      //         </div>
                      //       </div>
                      //     );
                      //   }}
                      // />
                      <ChannelListProvider>
                        {/* <ChannelListHeader /> */}

                        <List setChannel={setChannel} />
                      </ChannelListProvider>
                    ) : (
                      // <List setChannel={setChannel} />
                      <Channel
                        // @ts-ignore
                        channelUrl={channel.url}
                        renderChannelHeader={(state) => {
                          console.log("state", state);
                          return (
                            <div className="w-full h-14 flex items-center px-5">
                              <button
                                className="font-bold text-2xl"
                                onClick={back}
                              >
                                ←
                              </button>
                            </div>
                          );
                        }}
                      />
                    )}

                    {/* <Messaging /> */}
                  </SendbirdProvider>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;

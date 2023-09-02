import { useUserWallet } from "@/src/providers";
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import { useState } from "react";

import dynamic from "next/dynamic";

import ChannelList from "@sendbird/uikit-react/ChannelList";
const Channel = dynamic(() => import("@sendbird/uikit-react/Channel"), {
  ssr: false,
});

import {
  useChannelListContext,
  ChannelListProvider,
} from "@sendbird/uikit-react/ChannelList/context";

import List from "./list";
import { useChat } from "@/src/providers/chatProvider";

const Messaging = () => {
  const { currentUser } = useUserWallet();

  const { currentChannel, setCurrentChannel } = useChat();

  const back = () => {
    setCurrentChannel(null);
  };

  return (
    <div className="w-full h-full pt-4">
      {currentUser && (
        <SendbirdProvider
          appId={"54A96D9A-1DEA-4962-9F4E-9899BAE7011D"}
          userId={String(currentUser?.id)}
          nickname={currentUser?.name}
          profileUrl={currentUser?.picture}
        >
          {!currentChannel ? (
            <ChannelListProvider>
              <List setChannel={currentChannel} />
            </ChannelListProvider>
          ) : (
            <Channel
              // @ts-ignore
              channelUrl={currentChannel.url}
              style={{ maxWidth: "35rem" }}
              renderChannelHeader={(state) => {
                console.log("state", state);
                return (
                  <div className="w-full h-14 flex items-center px-5">
                    <button className="font-bold text-2xl" onClick={back}>
                      ←
                    </button>
                  </div>
                );
              }}
            />
          )}
        </SendbirdProvider>
      )}
    </div>
  );
};

export default Messaging;

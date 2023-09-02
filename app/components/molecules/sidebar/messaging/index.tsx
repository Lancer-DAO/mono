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

const Messaging = () => {
  const { currentUser } = useUserWallet();

  const [channel, setChannel] = useState<any | null>();

  const back = () => {
    setChannel(null);
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
          {!channel ? (
            <ChannelListProvider>
              <List setChannel={setChannel} />
            </ChannelListProvider>
          ) : (
            <Channel
              // @ts-ignore
              channelUrl={channel.url}
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

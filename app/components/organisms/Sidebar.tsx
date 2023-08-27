import { useUserWallet } from "@/src/providers";
import dynamic from "next/dynamic";
import { useState } from "react";

const ChannelList = dynamic(() => import("@sendbird/uikit-react/ChannelList"), {
  ssr: false,
});

const SendbirdApp = dynamic(() => import("@sendbird/uikit-react/App"), {
  ssr: false,
});

const ChannelPreview = dynamic(
  () => import("@sendbird/uikit-react/ChannelList/components/ChannelPreview"),
  {
    ssr: false,
  }
);

const Channel = dynamic(() => import("@sendbird/uikit-react/Channel"), {
  ssr: false,
});

import { useChannelListContext } from "@sendbird/uikit-react/ChannelList/context";

import "@sendbird/uikit-react/dist/index.css";

const Sidebar = () => {
  const { currentUser } = useUserWallet();

  const [channel, setChannel] = useState<any | null>();

  const state = useChannelListContext();

  //   console.log("state", state);

  console.log("currentChannel", channel);

  const back = () => {
    setChannel(null);
  };

  return (
    <div className="h-screen w-96 absolute top-0 right-0 bg-blue-50 z-50">
      {currentUser && (
        <>
          {!channel ? (
            <ChannelList
              // @ts-ignore
              onChannelSelect={(channel) => {
                if (channel && channel.url) {
                  // compare to prevChannel, if same dont set
                  if (channel && channel.url) {
                    setChannel(channel);
                  }
                }
              }}
            />
          ) : (
            <Channel
              channelUrl={channel.url}
              renderChannelHeader={() => {
                return (
                  <div className="w-full h-14 flex items-center px-5">
                    <button className="font-bold text-2xl" onClick={back}>
                      ←
                    </button>
                  </div>
                );
              }}
            ></Channel>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;

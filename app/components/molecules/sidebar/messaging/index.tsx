import { useUserWallet } from "@/src/providers";
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import { useState } from "react";

import dynamic from "next/dynamic";

import ChannelList from "@sendbird/uikit-react/ChannelList";
const Channel = dynamic(() => import("@sendbird/uikit-react/Channel"), {
  ssr: false,
});

import List from "./list";

const Messaging = () => {
  const { currentUser } = useUserWallet();

  const [channel, setChannel] = useState<any | null>();

  const back = () => {
    setChannel(null);
  };

  return (
    <div className="w-full pt-4">
      {currentUser && (
        <>
          {!channel ? (
            <ChannelList
              // @ts-ignore
              onChannelSelect={(channel) => {
                if (channel && channel.url) {
                  // compare to prevChannel, if same dont set
                  if (channel && channel.url) {
                    // setChannel(channel);
                  }
                }
              }}
              className="w-full m-0"
              renderChannelPreview={({ channel }) => {
                console.log("channel", channel);

                // filter channel.members, if there are only 2 members, then it's a DM
                // filter by current user and and return the other user

                // members: { nickname: string, userId: string, plainProfileUrl: string }[]

                const meta =
                  channel.members.length === 2
                    ? channel.members.filter(
                        (member) => member.userId !== String(currentUser?.id)
                      )[0]
                    : null;

                console.log("meta", meta);

                // what can the type of meta be?
                // { nickname: string, userId: string, plainProfileUrl: string }

                return (
                  <div
                    className="w-full flex items-center cursor-pointer gap-x-2 h-20 px-3 border-b border-neutral-300"
                    onClick={() => {
                      setChannel(channel);
                    }}
                  >
                    <img
                      src={
                        meta
                          ? meta.plainProfileUrl
                          : channel.creator.plainProfileUrl
                      }
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />

                    <div className="w-full">
                      <div>{meta ? meta.nickname : channel.name}</div>
                      <div className="truncate">
                        {channel.lastMessage ? channel.lastMessage.message : ""}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          ) : (
            // <List setChannel={setChannel} />
            <Channel
              // @ts-ignore
              channelUrl={channel.url}
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
            ></Channel>
          )}
        </>
      )}
    </div>
  );
};

export default Messaging;

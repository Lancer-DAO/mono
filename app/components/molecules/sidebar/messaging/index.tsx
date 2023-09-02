import { useUserWallet } from "@/src/providers";
import { ChannelListProvider } from "@sendbird/uikit-react/ChannelList/context";
import List from "./list";
import { useChat } from "@/src/providers/chatProvider";
import Channel from "./channel";

const Messaging = () => {
  const { currentUser } = useUserWallet();
  const { currentChannel } = useChat();

  return (
    <div className="w-full h-full">
      {currentUser && (
        <>
          {!currentChannel ? (
            <ChannelListProvider>
              <List setChannel={currentChannel} />
            </ChannelListProvider>
          ) : (
            <Channel />
          )}
        </>
      )}
    </div>
  );
};

export default Messaging;

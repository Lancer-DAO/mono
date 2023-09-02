import { useChat } from "@/src/providers/chatProvider";
import Channel from "@sendbird/uikit-react/Channel";
// import ChannelHeader from "@sendbird/uikit-react/Channel/components/ChannelHeader";

const Chat = () => {
  const { currentChannel, setCurrentChannel } = useChat();

  const back = () => {
    setCurrentChannel(null);
  };

  return <Channel channelUrl={currentChannel.url}  />;
};

export default Chat;

import { useChat } from "@/src/providers/chatProvider";
import Channel from "@sendbird/uikit-react/Channel";

const Chat = () => {
  const { currentChannel, setCurrentChannel } = useChat();

  return <Channel channelUrl={currentChannel.url} />;
};

export default Chat;

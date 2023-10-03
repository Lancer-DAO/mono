import { useEffect } from "react";
import { useUserWallet } from "@/src/providers";
import { useChannelContext } from "@sendbird/uikit-react/Channel/context";
import Image from "next/image";

const ChatList = () => {
  const channelState = useChannelContext();
  const { currentUser } = useUserWallet();

  useEffect(() => {
    const elem = document.getElementById("chat");
    elem.scrollTop = elem.scrollHeight;
  }, [channelState]);

  return (
    <div className="w-full p-4 flex-grow flex flex-col gap-y-1.5">
      {channelState.allMessages.map((message, key) => {
        const isSender = message.sender.userId === String(currentUser.id);

        return (
          <div
            className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            key={key}
          >
            <div className={`flex gap-x-2 ${isSender && "flex-row-reverse"}`}>
              <div className="w-8 h-8 relative">
                {
                  // if theres 2 consiqutive messages from the same sender, only show profile pic on the last one
                  channelState.allMessages[key + 1] &&
                  channelState.allMessages[key + 1].sender.userId ===
                    message.sender.userId ? null : (
                    <Image
                      src={message.sender.plainProfileUrl}
                      alt="chat user"
                      width={32}
                      height={32}
                      className="rounded-full overflow-hidden flex-shrink-0"
                    />
                  )
                }
              </div>
              <div
                className={`p-2.5 py-1.5 rounded text-black text-sm ${
                  isSender ? "bg-secondary100" : "bg-neutral100"
                }`}
              >
                {message.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;

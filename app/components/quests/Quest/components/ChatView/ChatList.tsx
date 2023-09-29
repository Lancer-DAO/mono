import { useBounty } from "@/src/providers/bountyProvider";
import { useChannelContext } from "@sendbird/uikit-react/Channel/context";

const ChatList = () => {
  const channelState = useChannelContext();
  console.log(channelState);

  const { currentBounty } = useBounty();

  return (
    <div className="w-full h-full p-4 flex-grow flex flex-col gap-y-1.5">
      {channelState.allMessages.map((message, key) => {
        const isSender =
          message.sender.userId === String(currentBounty.creator.userid);

        console.log(
          message.sender.userId,
          currentBounty.creator.userid,
          isSender
        );

        return (
          <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-x-2 ${isSender && "flex-row-reverse"}`}>
              {
                // if theres 2 consiqutive messages from the same sender, only show profile pic on the last one

                channelState.allMessages[key + 1] &&
                channelState.allMessages[key + 1].sender.userId ===
                  message.sender.userId ? (
                  <div className="w-8 h-8"></div>
                ) : (
                  <img
                    src={message.sender.plainProfileUrl}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                )
              }
              <div
                className={`p-2.5 py-1.5 rounded text-white ${
                  isSender ? "bg-secondary200" : "bg-secondary300"
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

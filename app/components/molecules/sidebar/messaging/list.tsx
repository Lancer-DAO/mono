import { useUserWallet } from "@/src/providers";
import { useChat } from "@/src/providers/chatProvider";
import { useChannelListContext } from "@sendbird/uikit-react/ChannelList/context";
import Image from "next/image";

const List = ({ setChannel }: { setChannel: (channel: any) => void }) => {
  const { allChannels } = useChannelListContext();
  const { currentUser } = useUserWallet();

  const { setCurrentChannel } = useChat();

  // console.log("allChannels", allChannels);

  return (
    <div>
      {allChannels?.map((channel) => {
        const meta =
          channel.members.length === 2
            ? channel.members.filter(
                (member) => member.userId !== String(currentUser?.id)
              )[0]
            : null;

        return (
          <div
            className="w-[35rem] hover:bg-slate-100 flex items-center 
            cursor-pointer gap-3 h-20 px-3 border-b border-neutral-300"
            key={channel.url}
            onClick={() => {
              setCurrentChannel(channel);
            }}
          >
            <Image
              src={
                meta ? meta.plainProfileUrl : channel.creator.plainProfileUrl
              }
              width={40}
              height={40}
              alt={`${meta ? meta.nickname : channel.name}'s profile picture`}
              className="rounded-full overflow-hidden"
            />

            <div className="w-full">
              <div>{meta ? meta.nickname : channel.name}</div>
              <div className="truncate">
                {channel.lastMessage ? channel.lastMessage.message : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default List;

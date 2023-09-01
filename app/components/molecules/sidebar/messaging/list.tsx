import { useUserWallet } from "@/src/providers";
import { useChannelListContext } from "@sendbird/uikit-react/ChannelList/context";

const List = ({ setChannel }: { setChannel: (channel: any) => void }) => {
  const { allChannels } = useChannelListContext();
  const { currentUser } = useUserWallet();

  console.log("allChannels", allChannels);

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
            className="w-[35rem] hover:bg-slate-100 flex items-center cursor-pointer gap-x-2 h-20 px-3 border-b border-neutral-300"
            onClick={() => {
              setChannel(channel);
            }}
          >
            <img
              src={
                meta ? meta.plainProfileUrl : channel.creator.plainProfileUrl
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
      })}
    </div>
  );
};

export default List;

import SendbirdChat from "@sendbird/chat";
import {
  GroupChannel,
  GroupChannelModule,
  SendbirdGroupChat,
  GroupChannelListQueryParams,
  UnreadChannelFilter,
  QueryType,
} from "@sendbird/chat/groupChannel";

export type UnreadMessage = {
  sentAt: number;
  unreadCount: number;
  userId: number;
  userName: string;
};

export const sendbird = SendbirdChat.init({
  appId: process.env.NEXT_PUBLIC_SENDBIRD_APP_ID,
  modules: [new GroupChannelModule()],
}) as SendbirdGroupChat;

export const createGroupChannel = async ({
  admin,
  lancers,
  name,
}: {
  admin: string;
  lancers: string[];
  name: string;
}) => {
  const channel: GroupChannel = await sendbird.groupChannel.createChannel({
    name,
    operatorUserIds: [admin],
    invitedUserIds: lancers,
    isDistinct: false,
  });

  return channel.url;
};

export const createDM = async (ids: string[]) => {
  await sendbird.connect(ids[0]);
  const { url } = await sendbird.groupChannel.createChannel({
    invitedUserIds: ids,
    isDistinct: true,
  });

  return url;
};

export const getUnreadMessageCount = async (userId: string) => {
  await sendbird.connect(userId);
  return await sendbird.groupChannel.getTotalUnreadMessageCount();
};

export const getUnreadChannels = async (userId: string) => {
  await sendbird.connect(userId);
  const params: GroupChannelListQueryParams = {
    unreadChannelFilter: UnreadChannelFilter.UNREAD_MESSAGE,
  };
  const listQuery = sendbird.groupChannel.createMyGroupChannelListQuery(params);
  const channels = await listQuery.next();
  const messagesInfo: UnreadMessage[] = channels.map((channel) => {
    const sentAt = channel.lastMessage?.createdAt;
    const unreadCount = channel.unreadMessageCount;
    const userId = (channel.lastMessage as unknown as any)?.sender?.userId;
    const userName = (channel.lastMessage as unknown as any)?.sender?.nickname;
    return {
      sentAt,
      unreadCount,
      userId: parseInt(userId),
      userName,
    };
  });

  return messagesInfo;
};

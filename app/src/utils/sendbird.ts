import SendbirdChat from "@sendbird/chat";
import {
  GroupChannel,
  GroupChannelModule,
  SendbirdGroupChat,
} from "@sendbird/chat/groupChannel";

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

import SendbirdChat from "@sendbird/chat";
import {
  GroupChannel,
  GroupChannelModule,
  SendbirdGroupChat,
} from "@sendbird/chat/groupChannel";

export const sendbird = SendbirdChat.init({
  appId: "54A96D9A-1DEA-4962-9F4E-9899BAE7011D",
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

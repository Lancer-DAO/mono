import SendbirdChat from "@sendbird/chat";
import {
  OpenChannelModule,
  SendbirdOpenChat,
} from "@sendbird/chat/openChannel";

export const sendbird = SendbirdChat.init({
  appId: "54A96D9A-1DEA-4962-9F4E-9899BAE7011D",
  modules: [new OpenChannelModule()],
}) as SendbirdOpenChat;

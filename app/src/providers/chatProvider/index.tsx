import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import { useUserWallet } from "../userWalletProvider";
import "@sendbird/uikit-react/dist/index.css";

export interface IChatContext {
  isChatOpen: boolean;
  setIsChatOpen: (debug: boolean) => void;
  currentChannel: any;
  setCurrentChannel: (channel: any | null) => void;
}

export const ChatContext = createContext<IChatContext>({
  isChatOpen: false,
  setIsChatOpen: () => null,
  currentChannel: null,
  setCurrentChannel: () => null,
});

export function useChat(): IChatContext {
  return useContext(ChatContext);
}

interface IChatState {
  children?: React.ReactNode;
}
interface IChatProps {
  children?: ReactNode;
}

const ChatProvider: FunctionComponent<IChatState> = ({
  children,
}: IChatProps) => {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [currentChannel, setCurrentChannel] = useState<any | null>();

  const { currentUser } = useUserWallet();

  const contextProvider = {
    isChatOpen,
    setIsChatOpen,
    currentChannel,
    setCurrentChannel,
  };

  if (!currentUser) {
    return (
      <ChatContext.Provider value={contextProvider}>
        {children}
      </ChatContext.Provider>
    );
  }

  return (
    <SendbirdProvider
      appId={"54A96D9A-1DEA-4962-9F4E-9899BAE7011D"}
      userId={String(currentUser?.id)}
      colorSet={{
        "--sendbird-light-primary-300": "#22c55e",
        "--sendbird-light-primary-400": "#22c55e",
      }}
      nickname={currentUser?.name}
      profileUrl={currentUser?.picture}
    >
      <ChatContext.Provider value={contextProvider}>
        {children}
      </ChatContext.Provider>
    </SendbirdProvider>
  );
};
export default ChatProvider;

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
export interface IChatContext {
  isChatOpen: boolean;
  setIsChatOpen: (debug: boolean) => void;
}

export const ChatContext = createContext<IChatContext>({
  isChatOpen: false,
  setIsChatOpen: () => null,
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

  const contextProvider = {
    isChatOpen,
    setIsChatOpen,
  };
  return (
    <ChatContext.Provider value={contextProvider}>
      {children}
    </ChatContext.Provider>
  );
};
export default ChatProvider;

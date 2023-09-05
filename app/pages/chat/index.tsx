import { useUserWallet } from "@/src/providers";
import dynamic from "next/dynamic";

const SendbirdApp = dynamic(() => import("@sendbird/uikit-react/App"), {
  ssr: false,
});

import "@sendbird/uikit-react/dist/index.css";
import { sendbird } from "@/src/utils/sendbird";

const Chat = () => {
  const { currentUser } = useUserWallet();

  return (
    <div className="w-full h-[calc(100vh-12rem)]">
      {currentUser && (
        <SendbirdApp
          // @ts-ignore
          appId="54A96D9A-1DEA-4962-9F4E-9899BAE7011D"
          userId={String(currentUser.id)}
          nickname={currentUser.name}
          profileUrl={currentUser.picture}
        />
      )}
    </div>
  );
};

export default Chat;

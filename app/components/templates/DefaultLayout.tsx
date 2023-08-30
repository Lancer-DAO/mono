import { Header, JoyrideWrapper } from "@/components";
import { useUserWallet } from "@/src/providers";
import { ReactNode } from "react";
import Sidebar from "../organisms/Sidebar";
import SendbirdProvider from "@sendbird/uikit-react/SendbirdProvider";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useUserWallet();
  return (
    <div className="relative flex">
      <div className="flex-grow">
        <Header />
        {currentUser && <JoyrideWrapper />}
        <main>{children}</main>
      </div>
      <SendbirdProvider
        appId={"54A96D9A-1DEA-4962-9F4E-9899BAE7011D"}
        userId={String(currentUser?.id)}
      >
        {/* <Sidebar /> */}
      </SendbirdProvider>
    </div>
  );
};

export default DefaultLayout;

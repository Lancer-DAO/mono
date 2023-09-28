import { Header, JoyrideWrapper, SidePanel } from "@/components";
import { useUserWallet } from "@/src/providers";
import { ReactNode } from "react";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useUserWallet();

  return (
    <div className="relative flex mr-10">
      <div className="flex-grow">
        <Header />
        {currentUser && <JoyrideWrapper />}
        <main>{children}</main>
      </div>
      <SidePanel />
    </div>
  );
};

export default DefaultLayout;

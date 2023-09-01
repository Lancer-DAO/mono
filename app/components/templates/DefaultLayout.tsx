import { Header, JoyrideWrapper } from "@/components";
import { useUserWallet } from "@/src/providers";
import { ReactNode, useState } from "react";
import Sidebar from "../organisms/Sidebar";
import SidePanel from "../molecules/sidebar";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useUserWallet();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  return (
    <div className="relative flex">
      <div className="flex-grow">
        <Header setSidebarOpen={setSidebarOpen} />
        {currentUser && <JoyrideWrapper />}
        <main>{children}</main>
      </div>

      {/* {currentUser && <Sidebar />} */}
      <SidePanel open={isSidebarOpen} setOpen={setIsSidebarOpen} />
    </div>
  );
};

export default DefaultLayout;

import { Header, JoyrideWrapper } from "@/components";
import { useUserWallet } from "@/src/providers";
import { ReactNode } from "react";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useUserWallet();
  return (
    <div className="relative">
      <Header />

      {!!currentUser && <JoyrideWrapper />}
      <div className="page-content">{children}</div>
    </div>
  );
};

export default DefaultLayout;

import { Header, JoyrideWrapper } from "@/src/components";
import { useLancer } from "@/src/providers";
import { ReactNode } from "react";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useLancer();
  return (
    <div className="relative">
      <Header />

      {!!currentUser && <JoyrideWrapper />}
      <div className="page-content">{children}</div>
    </div>
  );
};

export default DefaultLayout;

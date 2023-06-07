import { Header } from "@/src/components";
import { ReactNode } from "react";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="relative">
      <Header />
      <div className="page-content">{children}</div>
    </div>
  );
};

export default DefaultLayout;

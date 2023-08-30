import { Header, JoyrideWrapper } from "@/components/organisms";
import { useUserWallet } from "@/src/providers";
import { ReactNode } from "react";

export const DefaultLayout: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useUserWallet();
  return (
    <div className="relative">
      <Header />

      {!!currentUser && <JoyrideWrapper />}
      <main>{children}</main>
    </div>
  );
};

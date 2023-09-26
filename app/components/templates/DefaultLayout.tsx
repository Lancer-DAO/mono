import { ReactNode } from "react";
import Image from "next/image";
import { Header, JoyrideWrapper } from "@/components";
import { useUserWallet } from "@/src/providers";
import SidePanel from "../molecules/sidebar";
import { useWindowSize } from "@/src/hooks";

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useUserWallet();

  const [width] = useWindowSize();

  const isMobile = width <= 830;
  if (isMobile) {
    return <MobilePlaceholder />;
  }

  return (
    <div className="relative flex">
      <div className="flex-grow">
        <Header />
        {currentUser && <JoyrideWrapper />}
        <main>{children}</main>
      </div>

      <SidePanel />
    </div>
  );
};

const MobilePlaceholder = () => {
  return (
    <div className="relative w-screen h-screen bg-neutral100">
      <div className="relative w-full h-full bg-[url('/assets/images/placeholder_bg.png')] bg-contain">
        <div className="h-full flex flex-col items-center justify-center z-30">
          <Image
            src="/assets/images/Lancer-Green-No-Background-p-1080.png"
            width={200}
            height={200}
            alt="mobile-placeholder"
          />
          <h1>Welcome, Lancer.</h1>
          <p className="text-center mt-2 px-10 text-sm">
            Please view our freelance marketplace on a desktop for the best
            experience. Mobile coming soon :&#41;
          </p>
        </div>
        <Image
          src="/assets/images/knight_left.png"
          width={150}
          height={150}
          alt="knight left"
          className="absolute bottom-0 left-0"
        />
        <Image
          src="/assets/images/knight_right.png"
          width={150}
          height={150}
          alt="knight right"
          className="absolute bottom-0 right-0"
        />
      </div>
    </div>
  );
};

export default DefaultLayout;

import { useLancer } from "@/src/providers";
import { LinkButton, ApiKeyModal } from "@/components";
import { useRef, useState } from "react";
import { useOutsideAlerter } from "@/src/hooks/useOutsideAlerter";

import dynamic from "next/dynamic";
import { Key } from "react-feather";
import Link from "next/link";
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
const AccountHeaderOptions = () => {
  const { currentUser } = useLancer();

  const { currentAPIKey } = useLancer();
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowOptions(false);
  });
  return currentUser !== null ? (
    <div className="relative ml-auto ">
      <div
        onClick={() => {
          setShowOptions(true);
        }}
      >
        <img
          src={`https://avatars.githubusercontent.com/u/${
            currentUser.githubId.split("|")[1]
          }?s=60&v=4`}
          className="h-[40px] w-[40px] rounded-full border-[1px] border-gray-600"
        />
      </div>
      {showOptions && (
        <div
          className="absolute items-center justify-center left-[-105px] top-[50px]  bg-white w-[250px] rounded-[20px] shadow-md"
          ref={wrapperRef}
        >
          <Link
            href={"/account"}
            className="flex rounded-t-[20px] h-[48px] py-[6px] items-center justify-center border-b-gray-600 border-b-[1px] hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
          >
            Account
          </Link>
          <WalletMultiButtonDynamic className="flex h-[48px] w-full py-[6px] items-center justify-center border-b-gray-600 border-b-[1px] border-solid hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out" />
          <button
            onClick={() => setShowModal(true)}
            className="flex h-[48px] w-full gap-[10px] py-[6px] items-center justify-center border-b-gray-600 border-b-[1px] hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
          >
            <Key />
            {currentAPIKey ? currentAPIKey.name : "Set API Key"}
          </button>
          <Link
            href={"/api/auth/logout"}
            className="flex h-[48px] rounded-b-[20px] py-[6px] items-center justify-center  hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
          >
            Logout
          </Link>
        </div>
      )}
      <ApiKeyModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  ) : (
    <LinkButton href="/api/auth/login"> Login</LinkButton>
  );
};

export default AccountHeaderOptions;

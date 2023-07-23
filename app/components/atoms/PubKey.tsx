import { PublicKey } from "@solana/web3.js";
import React from "react";
import { shortenPublicKey } from "@/utils";

const PubKey: React.FC<{
  pubKey: PublicKey;
  full?: boolean;
  noCopy?: boolean;
}> = ({ pubKey, full, noCopy }) => {
  const addy = pubKey.toString();

  return (
    <div
      onClick={async () => {
        if (noCopy) {
          return;
        }
        await navigator.clipboard.writeText(addy);
        alert(`Copied Address: ${addy}`);
      }}
      className="flex w-full h-[48px] rounded-b-[20px] py-[6px] items-center justify-center  hover:bg-turquoise-500 text-gray-800 hover:text-white-100 transition-colors duration-300 ease-in-out"
    >
      {full ? `Solana Address: ${pubKey}` : shortenPublicKey(pubKey)}
    </div>
  );
};

export default PubKey;

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
      className="hover:cursor-pointer hover:text-blue-500"
    >
      {full ? `Solana Address: ${pubKey}` : shortenPublicKey(pubKey)}
    </div>
  );
};

export default PubKey;
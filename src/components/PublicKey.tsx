import { PublicKey } from "@solana/web3.js";
import React from "react";
import { shortenPublicKey } from "@/utils";

export const PubKey: React.FC<{ pubKey: PublicKey }> = ({ pubKey }) => {
  const addy = pubKey.toString();

  return (
    <div
      onClick={async () => {
        await navigator.clipboard.writeText(addy);
        alert(`Copied Address: ${addy}`);
      }}
      className="public-key"
    >
      {shortenPublicKey(pubKey)}
    </div>
  );
};

import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { ConfirmFunding } from "../components/ConfirmTransaction";
const isMainnet = false;
import "@solana/wallet-adapter-react-ui/styles.css";
import { Issue } from "@/types";
import { DistributeFunding } from "../components/DistributeFunds";

interface Web3ProviderProps {
  port: chrome.runtime.Port;
  issue: Issue;
  popup: string;
}

export const Web3Provider = ({ port, issue, popup }: Web3ProviderProps) => {
  // You can also provide a custom RPC endpoint.
  const endpoint = clusterApiUrl(isMainnet ? "mainnet-beta" : "devnet");
  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        commitment: "confirmed",
      }}
    >
      {popup === "fund" ? (
        <ConfirmFunding port={port} issue={issue} />
      ) : (
        <DistributeFunding port={port} issue={issue} />
      )}
    </ConnectionProvider>
  );
};

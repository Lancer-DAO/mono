import { PublicKey } from "@solana/web3.js";

export const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const EXTENSION_DEV = true;
export const APP_ENDPOINT = "https://app.lancer.so";
export const DEMO_ENDPOINT = "https://demo.lancer.so";
export const LOCAL_ENDPOINT = "http://localhost:3000";

export const getExtensionEndpoint = (env: string) => {
  if (env === "app") {
    return APP_ENDPOINT;
  } else if (env === "demo") {
    return DEMO_ENDPOINT;
  } else {
    return LOCAL_ENDPOINT;
  }
};

export const getMintName = (mint?: PublicKey) => {
  if (!mint) {
    return "USDC";
  }
  const mintString = mint.toString();
  if (mintString === USDC_MINT || mintString === MAINNET_USDC_MINT) {
    return "USDC";
  }

  return "SOL";
};

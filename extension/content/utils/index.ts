import { PublicKey } from "@solana/web3.js";

export const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const EXTENSION_DEV = false;
export const API_ENDPOINT = "https://app.lancer.so";
export const API_ENDPOINT_DEV = "http://localhost:3000";
export const getApiEndpointExtension = (): string => {
  return EXTENSION_DEV ? API_ENDPOINT_DEV : API_ENDPOINT;
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

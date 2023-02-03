import { PublicKey } from "@solana/web3.js";
import { IS_MAINNET } from "@/constants";

export const shortenPublicKey = (key: PublicKey) => {
  return `${key.toString().slice(0, 4)}...${key.toString().slice(-4)}`;
};

export const getSolscanAddress = (hash: string) => {
  return `https://solscan.io/tx/${hash}${IS_MAINNET ? '' : '?cluster=devnet'}`
}
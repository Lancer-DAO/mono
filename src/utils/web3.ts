import { PublicKey } from "@solana/web3.js";

export const shortenPublicKey = (key: PublicKey) => {
  return `${key.toString().slice(0, 4)}...${key.toString().slice(-4)}`;
};

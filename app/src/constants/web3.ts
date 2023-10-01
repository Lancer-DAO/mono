import { MONO_DEVNET, MONO_MAINNET } from "@/escrow/sdk/constants";
import { PublicKey } from "@solana/web3.js";

export const MAINNET_RPC =
  "https://winter-necessary-smoke.solana-mainnet.discover.quiknode.pro";
export const IS_MAINNET = process.env.NEXT_PUBLIC_IS_MAINNET === "true";
export const IS_CUSTODIAL = process.env.NEXT_PUBLIC_IS_CUSTODIAL === "true";
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const BONK_MINT = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
export const BONK_DEMICALS = 5;
export const USDC_DECIMALS = 6;
export const USDC_MINT = IS_MAINNET ? MAINNET_USDC_MINT : DEVNET_USDC_MINT;
export const MONO_ADDRESS = IS_MAINNET ? MONO_MAINNET : MONO_DEVNET;
export const CREATE_COMPLETION_BADGES =
  process.env.NEXT_PUBLIC_CREATE_COMPLETION_BADGES === "true";

export const ADMIN_WALLETS = ["WbmLPptTGZTFK5ZSks7oaa4Qx69qS3jFXMrAsbWz1or"];
export const BUDDY_ADDRESS = IS_MAINNET
  ? "BUDDYtQp7Di1xfojiCSVDksiYLQx511DPdj2nbtG9Yu5"
  : "9zE4EQ5tJbEeMYwtS2w8KrSHTtTW4UPqwfbBSEkUrNCA";

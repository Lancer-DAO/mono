import { MONO_DEVNET, MONO_MAINNET } from "@/escrow/sdk/constants";

export const MAINNET_RPC =
  "https://winter-necessary-smoke.solana-mainnet.discover.quiknode.pro";
export const IS_MAINNET = process.env.IS_MAINNET;
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
export const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const BONK_MINT = "6dhTynDkYsVM7cbF7TKfC9DWB636TcEM935fq7JzL2ES";
export const USDC_MINT = IS_MAINNET ? MAINNET_USDC_MINT : DEVNET_USDC_MINT;
export const MONO_ADDRESS = IS_MAINNET ? MONO_MAINNET : MONO_DEVNET;

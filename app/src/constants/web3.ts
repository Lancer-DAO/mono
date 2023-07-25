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
export const USDC_MINT_ID = 1;
export const FEE_PAYER_ACCOUNT = new PublicKey(
  "pyrSoEahjKGKZpLWEYwCJ8zQAsYZckZH8ZqJ7yGd1ha"
);

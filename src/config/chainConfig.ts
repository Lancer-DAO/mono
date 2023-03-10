import { clusterApiUrl } from "@solana/web3.js";
import { CHAIN_NAMESPACES, CustomChainConfig } from "@web3auth/base";
import { IS_MAINNET } from "../constants/web3";

export const CHAIN_CONFIG = {
  mainnet: {
    displayName: "Ethereum Mainnet",
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: `https://mainnet.infura.io/v3/776218ac4734478c90191dde8cae483c`,
    blockExplorer: "https://etherscan.io/",
    ticker: "ETH",
    tickerName: "Ethereum",
  } as CustomChainConfig,
  solana: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    rpcTarget: IS_MAINNET ? "https://winter-necessary-smoke.solana-mainnet.discover.quiknode.pro" : "https://rpc-devnet.helius.xyz/?api-key=2f915565-3608-4451-9150-4e72f50f10c2",
    blockExplorer: "https://explorer.solana.com/",
    chainId: "0x3",
    displayName: "Solana",
    ticker: "SOL",
    tickerName: "Solana",
  } as CustomChainConfig,
  polygon: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com/",
    chainId: "0x89",
    displayName: "Polygon Mainnet",
    ticker: "matic",
    tickerName: "Matic",
  } as CustomChainConfig,
} as const;

export type CHAIN_CONFIG_TYPE = keyof typeof CHAIN_CONFIG;

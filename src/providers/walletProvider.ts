import { PublicKey } from "@solana/web3.js";
import { SafeEventEmitterProvider } from "@web3auth/base";
import solanaProvider from "./solanaProvider";

export interface IWalletProvider {
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<number>;
  signAndSendTransaction: (amount: number, receipient: string, mint?: PublicKey) => Promise<string>;
  signTransaction: () => Promise<void>;
  signMessage: () => Promise<void>;
}

export const getWalletProvider = (chain: string, provider: SafeEventEmitterProvider, uiConsole: any): IWalletProvider => {
  if (chain === "solana") {
    return solanaProvider(provider, uiConsole);
  }
};

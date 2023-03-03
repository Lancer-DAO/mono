import { PublicKey, Transaction } from "@solana/web3.js";
import { SafeEventEmitterProvider } from "@web3auth/base";
import solanaProvider from "./solanaProvider";
import { SolanaWallet } from "@web3auth/solana-provider";
import { MyWallet } from "@/src/onChain";



export interface IWalletProvider {
  getAccounts: () => Promise<any>;
  getBalance: () => Promise<number>;
  signAndSendTransaction: (transaction: Transaction) => Promise<string>;
  signTransaction: () => Promise<void>;
  signMessage: () => Promise<void>;
  getWallet: () => MyWallet;
  setPubKey: (pk: PublicKey) => void;
}

export const getWalletProvider = (chain: string, provider: SafeEventEmitterProvider, uiConsole: any): IWalletProvider => {
    return solanaProvider(provider, uiConsole);
};

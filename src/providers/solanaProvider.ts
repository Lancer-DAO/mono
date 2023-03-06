import { CustomChainConfig, SafeEventEmitterProvider } from "@web3auth/base";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Keypair } from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { IWalletProvider } from "./walletProvider";
import {createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress, getMint, TokenAccountNotFoundError} from "@solana/spl-token"
import { MyWallet } from "@/src/onChain";

const solanaProvider = (provider: SafeEventEmitterProvider): IWalletProvider => {
  const solanaWallet = new MyWallet(provider);

  const setPubKey = (pk: PublicKey) => {
    solanaWallet.pubkey = pk
  }

  const getConnection = async (): Promise<Connection> => {
    const connectionConfig = await solanaWallet.request<CustomChainConfig>({ method: "solana_provider_config", params: [] });
    const conn = new Connection(connectionConfig.rpcTarget);
    return conn;
  };

  const getAccounts = async (): Promise<string[]> => {
    try {
      const acc = await solanaWallet.requestAccounts();
      if(!solanaWallet.publicKey) {
        solanaWallet.pubkey = new PublicKey(acc[0])
      }
      console.log("Solana accounts", acc);
      return acc;
    } catch (error) {
      console.error("Error", error);
      return [];
    }
  };

  const getBalance = async () => {
    try {
      const conn = await getConnection();
      const accounts = await solanaWallet.requestAccounts();
      const balance = await conn.getBalance(new PublicKey(accounts[0]));
      console.log('balance', balance)
      return balance;
    } catch (error) {
      console.error("Error", error);
    }
  };


  const signAndSendTransaction = async (transaction: Transaction): Promise<string> => {
    try {

      const signedTx = await solanaWallet.signAndSendTransaction(transaction);
      console.log(signedTx.signature);
       return signedTx.signature;
    } catch (e) {
      console.error(e)
    }
  };


  const getWallet=(): MyWallet => {
    return solanaWallet;
  }

  return { getAccounts, getBalance,  signAndSendTransaction, getWallet, setPubKey };
};

export default solanaProvider;

import { CustomChainConfig, SafeEventEmitterProvider } from "@web3auth/base";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Keypair } from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { IWalletProvider } from "./walletProvider";

const solanaProvider = (provider: SafeEventEmitterProvider, uiConsole: (...args: unknown[]) => void): IWalletProvider => {
  const solanaWallet = new SolanaWallet(provider);

  const getConnection = async (): Promise<Connection> => {
    const connectionConfig = await solanaWallet.request<CustomChainConfig>({ method: "solana_provider_config", params: [] });
    const conn = new Connection(connectionConfig.rpcTarget);
    return conn;
  };

  const getAccounts = async (): Promise<string[]> => {
    try {
      const acc = await solanaWallet.requestAccounts();
      uiConsole("Solana accounts", acc);
      return acc;
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
      return [];
    }
  };

  const getBalance = async () => {
    try {
      const conn = await getConnection();
      const accounts = await solanaWallet.requestAccounts();
      const balance = await conn.getBalance(new PublicKey(accounts[0]));
      uiConsole("Solana balance", balance);
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
    }
  };

  const signMessage = async (): Promise<void> => {
    try {
      const msg = Buffer.from("Test Signing Message ", "utf8");
      const res = await solanaWallet.signMessage(msg);
      uiConsole("Solana sign message", res);
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
    }
  };

  const signAndSendTransaction = async (amount: number, receipient: string): Promise<string> => {
    try {
      const conn = await getConnection();
      console.log(-1)
      const solWeb3 = new SolanaWallet(provider);
      const pubKeyArr = await solWeb3.requestAccounts();
      const pubKey = new PublicKey(pubKeyArr[0])

      const {blockhash, lastValidBlockHeight} = (await conn.getLatestBlockhash());

      const TransactionInstruction = SystemProgram.transfer({
        fromPubkey: pubKey,
        toPubkey: new PublicKey(receipient),
        lamports: amount * LAMPORTS_PER_SOL,
      });

      const txInfo = {
        /** The transaction fee payer */
        feePayer: pubKey,
        /** A recent blockhash */
        blockhash: blockhash,
        /** the last block chain can advance to before tx is exportd expired */
        lastValidBlockHeight: lastValidBlockHeight,
      }

      const transaction = new Transaction(txInfo).add(TransactionInstruction);
      // debugger

      const signature = await (await solWeb3.signAndSendTransaction(transaction));

      // const resp = await fetch('http://localhost:3001/ghToken?user_id=github|117492794&repo=github-app&org=Lancer-DAO&pull_number=18')

      // const data = await resp.json()
      // console.log(data)

      uiConsole("blockhash", blockhash, "transaction", transaction, "signature", signature, 'data', 'hi');
      return signature.signature;
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
    }
  };

  const signTransaction = async (): Promise<void> => {
    try {
      const conn = await getConnection();
      const solWeb3 = new SolanaWallet(provider);
      const pubKey = await solWeb3.requestAccounts();
      const blockhash = (await conn.getRecentBlockhash("finalized")).blockhash;
      // const TransactionInstruction = SystemProgram.transfer({
      //   fromPubkey: new PublicKey(pubKey[0]),
      //   toPubkey: new PublicKey(pubKey[0]),
      //   lamports: 0.01 * LAMPORTS_PER_SOL,
      // });
      // const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: new PublicKey(pubKey[0]) }).add(TransactionInstruction);
      // const signedTx = await solWeb3.signTransaction(transaction);
      // signedTx.serialize();
      uiConsole("signature", blockhash);
    } catch (error) {
      console.error("Error", error);
      uiConsole("error", error);
    }
  };

  return { getAccounts, getBalance, signMessage, signAndSendTransaction, signTransaction };
};

export default solanaProvider;

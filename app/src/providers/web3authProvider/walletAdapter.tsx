import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import RPC from "../solanaRPC";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import {
  CHAIN_NAMESPACES,
  CustomChainConfig,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { IS_MAINNET, MAINNET_RPC } from "@/src/constants";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { LoginConfig, OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { useWeb3Auth } from ".";
const SOLANA_CHAIN_CONFIG = {
  solana: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x3", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
    rpcTarget: "https://api.devnet.solana.com",
    displayName: "Solana Devnet",
    blockExplorer: "https://explorer.solana.com",
    ticker: "SOL",
    tickerName: "Solana Token",
  } as CustomChainConfig,
};
export interface WalletContextProps {
  wallet: null;
  connected: boolean;
  publicKey: PublicKey | null;
  connection: Connection | null;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signMessage: (message: string) => Promise<Uint8Array>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextProps>({
  wallet: null,
  connected: false,
  publicKey: null,
  connection: null,
  sendTransaction: () => Promise.reject(new Error("")),
  signTransaction: () => Promise.reject(new Error("")),
  signMessage: () => Promise.reject(new Error("")),
  connect: () => Promise.reject(new Error("")),
  disconnect: () => Promise.reject(new Error("")),
});

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const { web3Auth, provider } = useWeb3Auth();
  const [isLoading, setIsLoading] = useState(false);

  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  const connected = useMemo(() => !!publicKey, [publicKey]);

  const sendTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!provider) {
        throw new Error("provider not initialized yet");
      }
      const rpc = new RPC(provider);
      return await rpc.sendTransaction(transaction);
    },
    [provider]
  );

  const signTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!provider) {
        throw new Error("provider not initialized yet");
      }
      const rpc = new RPC(provider);
      return await rpc.signTransaction(transaction);
    },
    [provider]
  );

  const signMessage = useCallback(
    async (message: string) => {
      if (!provider) {
        throw new Error("provider not initialized yet");
      }
      const rpc = new RPC(provider);
      return await rpc.signMessage(message);
    },
    [provider]
  );

  useEffect(() => {
    const currentChainConfig = SOLANA_CHAIN_CONFIG.solana;

    async function init() {
      try {
        setIsLoading(true);
        // get your client id from https://dashboard.web3auth.io by registering a plug and play application.
        const clientId =
          "BDKhjMpf2-LsH5SyWrKFe2SBbGjeLS64a7pobYFQJapKW4qqRkREoUcrsi9cNRh40ZjGGQTH3izCNQjqq7fxb3E";

        const web3AuthInstance = new Web3AuthNoModal({
          chainConfig: currentChainConfig,
          clientId,
          web3AuthNetwork,
        });
        var loginConfig: LoginConfig = {
          jwt: {
            verifier: "lancer-devnet",
            typeOfLogin: "jwt",
            clientId: "0j9xN7veV1ofNVAgCMfHf6S4m09lLzW0",
          },
        };

        const privateKeyProvider = new SolanaPrivateKeyProvider({
          config: { chainConfig: currentChainConfig },
        });

        const adapter = new OpenloginAdapter({
          privateKeyProvider,
          adapterSettings: {
            clientId,
            uxMode: "redirect",
            loginConfig,
          },
        });
        web3AuthInstance.configureAdapter(adapter);
        await web3AuthInstance.init();
        setWeb3auth(web3AuthInstance);
        setweb3authinit(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [web3AuthNetwork, setWalletProvider]);

  const loginRWA = async (
    adapter: WALLET_ADAPTER_TYPE,
    loginProvider: LOGIN_PROVIDER_TYPE,
    jwt_token: string
  ) => {
    try {
      setIsLoading(true);
      if (!web3Auth) {
        console.log("web3auth not initialized yet");
        uiConsole("web3auth not initialized yet");
        return;
      }
      const localProvider = await web3Auth.connectTo(adapter, {
        loginProvider,
        extraLoginOptions: {
          id_token: jwt_token,
          domain: "https://auth.lancer.so",
          verifierIdField: "sub",
        },
      });

      setWalletProvider(localProvider!);
      const user = await localProvider!.getUserInfo();
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    if (!web3auth) {
      throw new Error("web3auth not initialized yet");
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
  };

  const getAccounts = async () => {
    if (!provider) {
      throw new Error("provider not initialized yet");
    }
    const rpc = new RPC(provider);
    return await rpc.getAccounts();
  };

  useEffect(() => {
    if (!provider) {
      setPublicKey(null);
      return;
    }

    getAccounts().then(([account]) => {
      setPublicKey(new PublicKey(account));
    });
  }, [provider]);

  const disconnect = async () => {
    if (!web3auth) {
      throw new Error("web3auth not initialized yet");
    }
    await web3auth.logout();
    setProvider(null);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet: null,
        connected,
        publicKey,
        sendTransaction,
        signMessage,
        connect,
        disconnect,
        connection,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);

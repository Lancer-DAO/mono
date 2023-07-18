import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  CustomChainConfig,
  SafeEventEmitterProvider,
  WALLET_ADAPTER_TYPE,
} from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import {
  SolanaPrivateKeyProvider,
  SolanaWallet,
} from "@web3auth/solana-provider";
import {
  LOGIN_PROVIDER_TYPE,
  LoginConfig,
  OpenloginAdapter,
  PrivateKeyProvider,
} from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import solanaProvider, { WalletActions } from "./solanaProvider";
import axios from "axios";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { LancerWallet } from "@/src/types";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { IS_MAINNET, MONO_ADDRESS } from "@/src/constants";

import { AnchorProvider, Program } from "@project-serum/anchor";
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

export const WEB3AUTH_NETWORK = {
  cyan: {
    displayName: "Cyan",
  },
  testnet: {
    displayName: "Test",
  },
} as const;
export type WEB3AUTH_NETWORK_TYPE = keyof typeof WEB3AUTH_NETWORK;

export interface IWeb3AuthContext {
  web3Auth: Web3AuthNoModal | null;
  wallet: LancerWallet | null;
  isLoading: boolean;
  user: unknown;
  isWeb3AuthInit: boolean;
  loginRWA: (
    adapter: WALLET_ADAPTER_TYPE,
    provider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  getUserInfo: () => Promise<any>;

  program: Program<MonoProgram>;
  provider: AnchorProvider;
}

export const Web3AuthContext = createContext<IWeb3AuthContext>({
  web3Auth: null,
  isLoading: false,
  user: null,
  isWeb3AuthInit: false,
  setIsLoading: (loading: boolean) => {},
  loginRWA: async (
    adapter: WALLET_ADAPTER_TYPE,
    provider: LOGIN_PROVIDER_TYPE,
    jwtToken: string
  ) => {},
  logout: async () => {},
  getUserInfo: async () => {},
  provider: null,
  program: null,
  wallet: null,
});

export function useWeb3Auth(): IWeb3AuthContext {
  return useContext(Web3AuthContext);
}

interface IWeb3AuthState {
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  children?: React.ReactNode;
}
interface IWeb3AuthProps {
  children?: ReactNode;
  web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
}

export const Web3AuthProvider: FunctionComponent<IWeb3AuthState> = ({
  children,
  web3AuthNetwork,
}: IWeb3AuthProps) => {
  const [web3Auth, setWeb3Auth] = useState<Web3AuthNoModal | null>(null);
  const [walletAction, setWalletActions] = useState<WalletActions | null>(null);
  const [wallet, setWallet] = useState<LancerWallet | null>(null);
  const { connection } = useConnection();
  const [user, setUser] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWeb3AuthInit, setweb3authinit] = useState(false);

  const [web3AuthProvider, setWeb3AuthProvider] =
    useState<SafeEventEmitterProvider>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const [program, setProgram] = useState<Program<MonoProgram>>();

  const setWalletProvider = useCallback(
    (web3authProvider: SafeEventEmitterProvider) => {
      const walletProvider = solanaProvider(web3authProvider, uiConsole);
      const solanaWallet = new SolanaWallet(web3authProvider);
      setTimeout(async () => {
        const acc = await solanaWallet.requestAccounts();
        const wallet = {
          ...walletProvider,
          connected: true,
          publicKey: new PublicKey(acc[0]),
          wallet: null,
        };
        setWallet(wallet);

        const provider = new AnchorProvider(connection, wallet, {});
        const program = new Program<MonoProgram>(
          MonoProgramJSON as unknown as MonoProgram,
          new PublicKey(MONO_ADDRESS),
          provider
        );
        setProvider(provider);
        setProgram(program);
        setWeb3AuthProvider(web3authProvider);
      }, 1000);
    },
    []
  );

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3AuthNoModal) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        axios.post("/api/web3auth/registerToken", { data: data });
        setUser(data);
        setWalletProvider(web3auth.provider!);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

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
        subscribeAuthEvents(web3AuthInstance);
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
        setWeb3Auth(web3AuthInstance);
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
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    // window.open("https://auth.lancer.so" + "/v2/logout?federated");

    setProvider(null);
    window.sessionStorage.clear();
    window.location.href = "/";
  };

  const getUserInfo = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3Auth.getUserInfo();
    uiConsole(user);
  };

  const uiConsole = (...args: unknown[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  const contextProvider = {
    web3Auth,
    user,
    isLoading,
    isWeb3AuthInit,
    setIsLoading,
    loginRWA,
    logout,
    getUserInfo,
    wallet,
    provider,
    program,
  };
  return (
    <Web3AuthContext.Provider value={contextProvider}>
      {children}
    </Web3AuthContext.Provider>
  );
};

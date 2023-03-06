import {
  ADAPTER_EVENTS,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
  WALLET_ADAPTER_TYPE,
} from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import type { LOGIN_PROVIDER_TYPE } from "@toruslabs/openlogin";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { WEB3AUTH_NETWORK_TYPE } from "../config/web3AuthNetwork";
import { getWalletProvider, IWalletProvider } from "./walletProvider";
import { APP_CONFIG_TYPE } from "../config/appConfig";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { MyWallet } from "@/src/onChain";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import solanaProvider from "@/src/providers/solanaProvider";
import { getApiEndpoint, getEndpoint } from "@/src/utils";
import { REACT_APP_CLIENTID } from "@/src/constants";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_ROUTE, DATA_API_ROUTE } from "@/server/src/constants";
import { MONO_DEVNET } from "@/escrow/sdk/constants";

export const REACT_APP_CLIENT_ID =
  "BPMZUkEx6a1aHvk2h_4efBlAJNMlPGvpTOy7qIkz4cbtF_l1IHuZ7KMqsLNPTtDGDItHBMxR6peSZc8Mf-0Oj6U";
export const REACT_APP_CLIENT_ID_DEV =
  "BO2j8ZVZjLmRpGqhclE_xcPdWjGMZYMsDy5ZWgZ7FJSA-zJ2U4huIQAKKuKDe8BSABl60EQXjbFhnx78et4leB0";
export const REACT_APP_VERIFIER = "lancer0";
export const REACT_APP_AUTH0_DOMAIN = "https://dev-kgvm1sxe.us.auth0.com";
export const REACT_APP_SPA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
export const REACT_APP_RWA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
export const REACT_APP_BACKEND_SERVER_API = "http://localhost:3001/callback";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";

export class LancerWallet extends SolanaWallet {
  pk: PublicKey;
  constructor(readonly provider: SafeEventEmitterProvider) {
    super(provider);
  }

  set pubkey(pk: PublicKey) {
    this.pk = pk;
  }

  get publicKey(): PublicKey {
    return this.pk;
  }
}

type LOGIN_STATE =
  | "logged_out"
  | "retrieving_jwt"
  | "initializing_wallet"
  | "getting_user"
  | "initializing_anchor"
  | "ready";

export interface User {
  publicKey: PublicKey;
  githubId: string;
  githugLogin: string;
  name: string;
  token: string;
}

export interface ILancerContext {
  user: User;
  loginState: LOGIN_STATE;
  anchor: AnchorProvider;
  program: Program<MonoProgram>;
  web3Auth: Web3AuthCore;
  wallet: LancerWallet;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const LancerContext = createContext<ILancerContext>({
  user: null,
  loginState: "logged_out",
  anchor: null,
  program: null,
  web3Auth: null,
  wallet: null,
  login: async () => {},
  logout: async () => {},
});

export function useLancer(): ILancerContext {
  return useContext(LancerContext);
}

interface ILancerState {
  children?: React.ReactNode;
  referrer: string;
}
interface ILancerProps {
  children?: ReactNode;
  referrer: string;
}

export const LancerProvider: FunctionComponent<ILancerState> = ({
  children,
  referrer,
}: ILancerProps) => {
  const [anchor, setAnchor] = useState<AnchorProvider | null>(null);
  const [program, setProgram] = useState<Program<MonoProgram> | null>(null);
  const [wallet, setWallet] = useState<LancerWallet | null>(null);
  const [web3Auth, setWeb3Auth] = useState<Web3AuthCore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loginState, setLoginState] = useState<LOGIN_STATE | null>(
    "logged_out"
  );
  const search = useLocation().search;
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const setWalletProvider = useCallback(
    (web3authProvider: SafeEventEmitterProvider) => {
      const walletProvider = new LancerWallet(web3authProvider);
      setTimeout(async function () {
        const accounts = await walletProvider.requestAccounts();
        walletProvider.pk = new PublicKey(accounts[0]);
        setWallet(walletProvider);
        setLoginState("getting_user");
      }, 1000);
    },
    []
  );

  useEffect(() => {
    console.log("hi");
    const subscribeAuthEvents = (web3auth: Web3AuthCore) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
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

    const currentChainConfig = CHAIN_CONFIG["solana"];

    async function init() {
      try {
        // get your client id from https://dashboard.web3auth.io by registering a plug and play application.
        // const clientId = process.env.NODE_ENV === 'development' ?
        //   REACT_APP_CLIENT_ID: REACT_APP_CLIENT_ID_DEV;
        const clientId = REACT_APP_CLIENT_ID;

        const web3AuthInstance = new Web3AuthCore({
          chainConfig: currentChainConfig,
          clientId: clientId,
        });
        subscribeAuthEvents(web3AuthInstance);
        // alert(sessionStorage.getItem('app'))
        const adapter = new OpenloginAdapter({
          adapterSettings: {
            network: "cyan",
            clientId,
            uxMode: "redirect",
            loginConfig: {
              jwt: {
                name: "rwa Auth0 Login",
                verifier: "lancer0",
                typeOfLogin: "jwt",
                clientId: REACT_APP_RWA_CLIENTID,
              },
            },
          },
        });

        web3AuthInstance.configureAdapter(adapter);

        await web3AuthInstance.init();

        setWeb3Auth(web3AuthInstance);

        const localProvider = await web3AuthInstance.provider;
        setLoginState("initializing_wallet");
        setWalletProvider(localProvider!);
      } catch (error) {
        console.error(error);
      }
    }

    const getUser = async () => {
      const web3AuthUser = await web3Auth.getUserInfo();
      const user = await axios.get(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_API_ROUTE}`,
        {
          params: {
            githubLogin: web3AuthUser.verifier,
          },
        }
      );
      setUser(user.data);
      setLoginState("initializing_anchor");
    };
    if (jwt === "" || jwt === null) {
      const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback?referrer=${referrer}`}&state=STATE`;
      setLoginState("retrieving_jwt");
      // debugger;
      window.location.href = rwaURL;
    } else if (
      jwt !== "" &&
      (loginState === "logged_out" || loginState === "retrieving_jwt")
    ) {
      init();
    } else if (loginState === "getting_user") {
      getUser();
    } else if (loginState === "initializing_anchor") {
      const connection = new Connection(getEndpoint());

      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_DEVNET),
        provider
      );
      setAnchor(provider);
      setProgram(program);
      setLoginState("ready");
      console.log("Lancer Ready!");
    }
  }, [
    jwt,
    loginState,
    setWalletProvider,
    setAnchor,
    setProgram,
    setLoginState,
    setUser,
    setWeb3Auth,
  ]);

  const login = async () => {
    console.log("hi");
    const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback?referrer=${referrer}`}&state=STATE`;
    setLoginState("retrieving_jwt");
    // debugger;
    window.location.href = rwaURL;
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    // if (sessionStorage.getItem("app") === "RWA") {
    window.location.href = REACT_APP_AUTH0_DOMAIN + "/v2/logout?federated";
    // }
    setAnchor(null);
    setWeb3Auth(null);
    setUser(null);
    setWallet(null);
    setProgram(null);
    window.sessionStorage.clear();
    window.location.href = "/";
  };

  const contextProvider = {
    web3Auth,
    wallet,
    anchor,
    program,
    user,
    loginState,
    login,
    logout,
  };
  return (
    <LancerContext.Provider value={contextProvider}>
      {children}
    </LancerContext.Provider>
  );
};

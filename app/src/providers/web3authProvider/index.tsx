import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { Issue, CurrentUser, LancerWallet, Bounty } from "@/src/types";
import {
  ILancerContext,
  ISSUE_LOAD_STATE,
  LOGIN_STATE,
} from "@/src/providers/lancerProvider/types";
import { api } from "@/src/utils/api";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "next/router";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { APIKeyInfo } from "@/src/components/molecules/ApiKeyModal";
import { MONO_ADDRESS } from "@/src/constants";
import { Tutorial } from "@/src/types/tutorials";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
const clientId =
  "BDKhjMpf2-LsH5SyWrKFe2SBbGjeLS64a7pobYFQJapKW4qqRkREoUcrsi9cNRh40ZjGGQTH3izCNQjqq7fxb3E";

interface IWeb3AuthLancerContext extends ILancerContext {
  web3auth: Web3AuthNoModal | null;
  providerWeb3Auth: SafeEventEmitterProvider | null;
  loggedIn: boolean | null;
  setLoggedIn: (loggedIn: boolean) => void;
  setProviderWeb3Auth: (provider: SafeEventEmitterProvider) => void;
}

export const Web3AuthLancerContext = createContext<IWeb3AuthLancerContext>({
  currentUser: null,
  issue: null,
  issues: [],
  loginState: "logged_out",
  issueLoadingState: "initializing",
  program: null,
  currentWallet: null,
  wallets: null,
  provider: null,
  currentBounty: null,
  currentAPIKey: null,
  currentTutorialState: null,
  isRouterReady: false,
  isMobile: false,
  setCurrentTutorialState: () => null,
  setCurrentAPIKey: () => null,
  setIssue: () => null,
  setIssues: () => null,
  setWallets: () => null,
  setLoginState: () => null,
  setCurrentUser: () => null,
  setIssueLoadingState: (state: ISSUE_LOAD_STATE) => null,
  setCurrentBounty: () => null,
  setCurrentWallet: () => null,
  web3auth: null,
  providerWeb3Auth: null,
  loggedIn: false,
  setLoggedIn: () => null,
  setProviderWeb3Auth: () => null,
});

export function useLancerWeb3Auth(): IWeb3AuthLancerContext {
  return useContext(Web3AuthLancerContext);
}

interface ILancerState {
  children?: React.ReactNode;
}
interface ILancerProps {
  children?: ReactNode;
}

const Web3AuthLancerProvider: FunctionComponent<ILancerState> = ({
  children,
}: ILancerProps) => {
  const { mutateAsync: getCurrUser } = api.users.login.useMutation();
  const router = useRouter();
  const {
    wallet,
    publicKey,
    sendTransaction,
    signAllTransactions,
    signMessage,
    signTransaction,
    connected,
  } = useWallet();
  const { connection } = useConnection();
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [providerWeb3Auth, setProviderWeb3Auth] =
    useState<SafeEventEmitterProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentBounty, setCurrentBounty] = useState<Bounty | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [currentTutorialState, setCurrentTutorialState] = useState<Tutorial>();
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [loginState, setLoginState] = useState<LOGIN_STATE | null>(
    "logged_out"
  );
  const [currentWallet, setCurrentWallet] = useState<LancerWallet>();
  const [wallets, setWallets] = useState<LancerWallet[]>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const [program, setProgram] = useState<Program<MonoProgram>>();
  const [currentAPIKey, setCurrentAPIKey] = useState<APIKeyInfo>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isMobileDevice =
      /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  useEffect(() => {
    const apiKeys = JSON.parse(localStorage.getItem("apiKeys") || "[]");
    const defaultKey = apiKeys.find((key: APIKeyInfo) => key.isDefault);
    setCurrentAPIKey(defaultKey);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.SOLANA,
          chainId: "0x3", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
          rpcTarget: "https://api.devnet.solana.com",
          displayName: "Solana Devnet",
          blockExplorer: "https://explorer.solana.com",
          ticker: "SOL",
          tickerName: "Solana Token",
        };
        const web3auth = new Web3AuthNoModal({
          clientId,
          chainConfig,
          web3AuthNetwork: "testnet",
          useCoreKitKey: false,
        });
        const privateKeyProvider = new SolanaPrivateKeyProvider({
          config: { chainConfig },
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            loginConfig: {
              jwt: {
                verifier: "lancer-dev",
                typeOfLogin: "jwt",
                clientId,
              },
            },
          },
          privateKeyProvider,
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        setProviderWeb3Auth(web3auth.provider);
        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (connected) {
      const lancerWallet: LancerWallet = {
        wallet,
        publicKey,
        sendTransaction,
        signAllTransactions,
        signMessage,
        signTransaction,
        connected,
        signAndSendTransaction: async (transaction: Transaction) => {
          return await sendTransaction(transaction, connection, {
            skipPreflight: true,
          });
        },
        providerName: "Phantom",
      };
      const provider = new AnchorProvider(connection, lancerWallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_ADDRESS),
        provider
      );
      setProvider(provider);
      setProgram(program);
      setCurrentWallet(lancerWallet);
      if (
        !!currentTutorialState &&
        currentTutorialState?.title === PROFILE_TUTORIAL_INITIAL_STATE.title &&
        currentTutorialState.currentStep === 1
      ) {
        setCurrentTutorialState({
          ...currentTutorialState,
          currentStep: currentUser.hasProfileNFT ? 3 : 2,
          isRunning: true,
          spotlightClicks: !currentUser.hasProfileNFT,
        });
        return;
      }
    }
  }, [connected]);

  //   useEffect(() => {
  //     const getUser = async () => {
  //       console.log("logging in user");
  //       const userInfo = await getCurrUser();
  //       console.log("login response", userInfo);
  //       setCurrentUser(userInfo);
  //     };
  //     if (user) {
  //       const getUser = async () => {
  //         try {
  //           const userInfo = await getCurrUser();
  //           setCurrentUser(userInfo);
  //         } catch (e) {
  //           // if (e.data.httpStatus === 401) {
  //           //   debugger;
  //           //   router.push("/api/auth/login");
  //           // }
  //         }
  //       };
  //       getUser();
  //     }
  //   }, [user]);

  const [issueLoadingState, setIssueLoadingState] =
    useState<ISSUE_LOAD_STATE>("initializing");

  const contextProvider = {
    currentUser,
    setCurrentUser,
    loginState,
    setLoginState,
    issue,
    setIssue,
    issues,
    setIssues,
    issueLoadingState,
    setIssueLoadingState,
    program,
    provider,
    setWallets,
    wallets,
    currentBounty,
    setCurrentBounty,
    currentWallet,
    setCurrentWallet,
    currentAPIKey,
    setCurrentAPIKey,
    currentTutorialState,
    setCurrentTutorialState,
    isRouterReady: router.isReady,
    isMobile,
    web3auth,
    providerWeb3Auth,
    loggedIn,
    setLoggedIn,
    setProviderWeb3Auth,
  };
  return (
    <Web3AuthLancerContext.Provider value={contextProvider}>
      {children}
    </Web3AuthLancerContext.Provider>
  );
};
export default Web3AuthLancerProvider;

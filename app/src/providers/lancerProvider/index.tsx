import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
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
import { getCookie } from "cookies-next";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
export * from "./types";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { APIKeyInfo } from "@/src/components/molecules/ApiKeyModal";
import { IS_MAINNET, MONO_ADDRESS } from "@/src/constants";
import { Step } from "react-joyride";

export const LancerContext = createContext<ILancerContext>({
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
  isTutorialRunning: false,
  isTutorialActive: false,
  currentTutorialStep: -1,
  tutorialSteps: [],
  spotlightClicks: false,
  isTutorialManuallyControlled: false,
  setIsTutorialManuallyControlled: () => null,
  setSpotlightClicks: () => null,
  setIsTutorialRunning: () => null,
  setIsTutorialActive: () => null,
  setTutorialSteps: () => null,
  setCurrentTutorialStep: () => null,
  setCurrentAPIKey: () => null,
  setIssue: () => null,
  setIssues: () => null,
  setWallets: () => null,
  setLoginState: () => null,
  setCurrentUser: () => null,
  setIssueLoadingState: (state: ISSUE_LOAD_STATE) => null,
  setCurrentBounty: () => null,
  setCurrentWallet: () => null,
});

export function useLancer(): ILancerContext {
  return useContext(LancerContext);
}

interface ILancerState {
  children?: React.ReactNode;
}
interface ILancerProps {
  children?: ReactNode;
}

const LancerProvider: FunctionComponent<ILancerState> = ({
  children,
}: ILancerProps) => {
  const { mutateAsync: getCurrUser } = api.users.login.useMutation();
  const { user } = useUser();
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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentBounty, setCurrentBounty] = useState<Bounty | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [currentTutorialStep, setCurrentTutorialStep] = useState<number>(-1);
  const [tutorialSteps, setTutorialSteps] = useState<Step[]>([]);
  const [isTutorialRunning, setIsTutorialRunning] = useState<boolean>(false);
  const [isTutorialActive, setIsTutorialActive] = useState<boolean>(false);
  const [spotlightClicks, setSpotlightClicks] = useState<boolean>(false);
  const [isTutorialManuallyControlled, setIsTutorialManuallyControlled] =
    useState<boolean>(false);
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [loginState, setLoginState] = useState<LOGIN_STATE | null>(
    "logged_out"
  );
  const [currentWallet, setCurrentWallet] = useState<LancerWallet>();
  const [wallets, setWallets] = useState<LancerWallet[]>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const [program, setProgram] = useState<Program<MonoProgram>>();
  const [currentAPIKey, setCurrentAPIKey] = useState<APIKeyInfo>();

  useEffect(() => {
    const apiKeys = JSON.parse(localStorage.getItem("apiKeys") || "[]");
    const defaultKey = apiKeys.find((key: APIKeyInfo) => key.isDefault);
    setCurrentAPIKey(defaultKey);
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
          return await sendTransaction(transaction, connection);
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
      if (isTutorialActive) {
        setIsTutorialRunning(true);
        setCurrentTutorialStep(2);
      }
    }
  }, [connected]);

  useEffect(() => {
    if (user) {
      const getUser = async () => {
        try {
          const userInfo = await getCurrUser();
          setCurrentUser(userInfo);
        } catch (e) {
          // if (e.data.httpStatus === 401) {
          //   debugger;
          //   router.push("/api/auth/login");
          // }
        }
      };
      getUser();
    }
  }, [user]);

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
    isTutorialRunning,
    setIsTutorialRunning,
    currentTutorialStep,
    setCurrentTutorialStep,
    tutorialSteps,
    setTutorialSteps,
    isTutorialActive,
    setIsTutorialActive,
    setSpotlightClicks,
    spotlightClicks,
    isTutorialManuallyControlled,
    setIsTutorialManuallyControlled,
  };
  return (
    <LancerContext.Provider value={contextProvider}>
      {children}
    </LancerContext.Provider>
  );
};
export default LancerProvider;

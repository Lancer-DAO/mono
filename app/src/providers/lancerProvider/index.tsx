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
import { createMagicWallet, magic } from "@/src/utils/magic";
import { api } from "@/src/utils/api";
import { getCookie } from "cookies-next";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
export * from "./types";

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

export const LancerProvider: FunctionComponent<ILancerState> = ({
  children,
}: ILancerProps) => {
  const { mutateAsync: getCurrUser } = api.users.currentUser.useMutation();
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
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [loginState, setLoginState] = useState<LOGIN_STATE | null>(
    "logged_out"
  );
  const [isGettingContract, setIsGettingContract] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<LancerWallet>();
  const [wallets, setWallets] = useState<LancerWallet[]>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const [program, setProgram] = useState<Program<MonoProgram>>();
  useEffect(() => {
    const getMagicWallet = async () => {
      const { coinflowWallet, program, provider } = await createMagicWallet();
      if (wallets) {
        wallets.push(coinflowWallet);
        setWallets(wallets);
      } else {
        setWallets([coinflowWallet]);
      }
      setProvider(provider);
      setProgram(program);
    };
    getMagicWallet();
  }, [magic?.user]);

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
          await signTransaction(transaction);
          return await sendTransaction(transaction, connection);
        },
      };
      if (wallets) {
        wallets.push(lancerWallet);
        setWallets(wallets);
      } else {
        setWallets([lancerWallet]);
      }
      setProvider(provider);
      setProgram(program);
      setCurrentWallet(lancerWallet);
    }
  }, [connected]);

  useEffect(() => {
    const getCurrentUser = async () => {
      setLoginState("logging_in");
      const user = await getCurrUser({
        session: getCookie("session") as string,
      });
      setCurrentUser({ ...user, magic: magic });
    };
    getCurrentUser();
  }, [magic?.user]);

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
  };
  return (
    <LancerContext.Provider value={contextProvider}>
      {children}
    </LancerContext.Provider>
  );
};

import { ADAPTER_EVENTS, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import {
  OpenloginAdapter,
  OpenloginAdapterOptions,
  OpenloginLoginParams,
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
import { CHAIN_CONFIG } from "../../config/chainConfig";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { getApiEndpoint, getEndpoint } from "@/src/utils";
import { CREATE_USER_ROUTE, REACT_APP_CLIENTID } from "@/src/constants";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_ROUTE } from "@/constants";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import RPC from "../solanaRPC";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import {
  Issue,
  BountyState,
  Contributor,
  User,
  CurrentUser,
  LancerWallet,
  Bounty,
} from "@/src/types";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import {
  ILancerContext,
  ISSUE_LOAD_STATE,
  LOGIN_STATE,
} from "@/src/providers/lancerProvider/types";
import { createMagicWallet, magic } from "@/src/utils/magic";
import { api } from "@/src/utils/api";
import { getCookie } from "cookies-next";
export * from "./types";

export const LancerContext = createContext<ILancerContext>({
  currentUser: null,
  issue: null,
  issues: [],
  loginState: "logged_out",
  issueLoadingState: "initializing",
  program: null,
  wallet: null,
  provider: null,
  currentBounty: null,
  setIssue: () => null,
  setIssues: () => null,
  setLoginState: () => null,
  setCurrentUser: () => null,
  setIssueLoadingState: (state: ISSUE_LOAD_STATE) => null,
  setCurrentBounty: () => null,
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

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentBounty, setCurrentBounty] = useState<Bounty | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [loginState, setLoginState] = useState<LOGIN_STATE | null>(
    "logged_out"
  );
  const [isGettingContract, setIsGettingContract] = useState(false);
  const [wallet, setWallet] = useState<LancerWallet>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const [program, setProgram] = useState<Program<MonoProgram>>();
  const [isWalletReady, setIsWalletReady] = useState(false);
  useEffect(() => {
    const getMagicWallet = async () => {
      const { coinflowWallet, program, provider } = await createMagicWallet();
      setWallet(coinflowWallet);
      setProvider(provider);
      setProgram(program);
      setIsWalletReady(true);
    };
    getMagicWallet();
  }, [magic?.user]);

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
    wallet,
    currentBounty,
    setCurrentBounty,
  };
  return (
    <LancerContext.Provider value={contextProvider}>
      {children}
    </LancerContext.Provider>
  );
};

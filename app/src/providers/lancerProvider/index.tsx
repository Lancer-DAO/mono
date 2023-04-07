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

  // useEffect(() => {
  //   const getContract = async () => {
  //     // if the contract is completed or canceled, the account will be closed and this
  //     // will cause an error
  //     if (
  //       issue.state === IssueState.COMPLETE ||
  //       issue.state === IssueState.CANCELED
  //     ) {
  //       setIssueLoadingState("loaded");
  //       setIsGettingContract(false);
  //       return;
  //     }
  //     if (
  //       // We haven't loaded info from on chain yet
  //       (!issue.escrowContract && issue.creator) ||
  //       // We just submitted a request, but the on chain query is still updating
  //       (issue.escrowContract &&
  //         issue.state === IssueState.AWAITING_REVIEW &&
  //         issue.escrowContract.currentSubmitter.toString() ===
  //           "11111111111111111111111111111111") ||
  //       // We just denied a request, but the on chain query is still updating
  //       (issue.escrowContract &&
  //         issue.state === IssueState.IN_PROGRESS &&
  //         issue.escrowContract.currentSubmitter.toString() !==
  //           "11111111111111111111111111111111")
  //     ) {
  //       // set this so we only send one request at a time
  //       setIsGettingContract(true);

  //       const newIssue = await getEscrowContract(issue, program, anchor);
  //       // if we are in one of the below states, then there is a mismatch
  //       // between the backend and what is on chain. This usually happens
  //       // when a change occurs on chain and in the backend, and the changes
  //       // are not reflected on chain yet
  //       if (
  //         !newIssue ||
  //         (issue.cancelVoters.length === 0 &&
  //           newIssue.state === IssueState.AWAITING_REVIEW &&
  //           newIssue.escrowContract.currentSubmitter.toString() ===
  //             "11111111111111111111111111111111") ||
  //         (issue.cancelVoters.length === 0 &&
  //           newIssue.state === IssueState.IN_PROGRESS &&
  //           newIssue.escrowContract.currentSubmitter.toString() !==
  //             "11111111111111111111111111111111")
  //       ) {
  //         setTimeout(() => {
  //           setIsGettingContract(false);
  //         }, 2000);
  //       } else {
  //         setIssue(newIssue);
  //         setIssueLoadingState("loaded");
  //         setIsGettingContract(false);
  //       }
  //     }
  //   };
  //   if (
  //     issue &&
  //     (issue.state === IssueState.COMPLETE ||
  //       issue.state === IssueState.CANCELED)
  //   ) {
  //     setIssueLoadingState("loaded");
  //     return;
  //   }
  //   if (
  //     issue &&
  //     program &&
  //     anchor &&
  //     anchor.connection &&
  //     issueLoadingState === "getting_contract" &&
  //     !isGettingContract
  //   ) {
  //     getContract();
  //   }
  // }, [
  //   !!program,
  //   !!issue,
  //   !!anchor,
  //   issueLoadingState,
  //   setIssueLoadingState,
  //   isGettingContract,
  //   setIsGettingContract,
  //   setIssue,
  // ]);

  // useEffect(() => {
  //   const query = async () => {
  //     setIssueLoadingState("getting_issue");
  //     //   get information on the current issue from the backend
  //     const issue = await queryIssue(issueId as string);
  //     setIssue(issue);
  //     //   if the user is loaded, then get all relations to the current issue
  //     if (
  //       user?.uuid &&
  //       issue?.allContributors
  //         .map((contributor) => contributor.uuid)
  //         .includes(user.uuid)
  //     ) {
  //       const userContributor = issue.allContributors.find(
  //         (contributor) => contributor.uuid === user.uuid
  //       );

  //       const updatedUser = getUserRelations(user, issue, userContributor);

  //       setUser(updatedUser);
  //     } else {
  //       setUser({ ...user, relations: [] });
  //     }
  //     setIssueLoadingState("getting_contract");
  //   };
  //   if (issueId !== undefined && anchor && program && forceGetIssue) {
  //     setForceGetIssue(false);
  //     query();
  //   }
  // }, [
  //   issueId,
  //   anchor,
  //   program,
  //   issue?.state,
  //   !!user,
  //   setUser,
  //   forceGetIssue,
  //   setForceGetIssue,
  // ]);

  // useEffect(() => {
  //   const query = async () => {
  //     // either get all issues, or issues the current user has a relation with
  //     const issues = await queryIssues(user, referrer);
  //     setIssues(issues);
  //   };
  //   if (user?.uuid && user?.repos) {
  //     query();
  //   }
  // }, [user, referrer]);

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

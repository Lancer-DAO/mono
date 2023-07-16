import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { APIKeyInfo } from "@/components/molecules/ApiKeyModal";
import { Bounty, CurrentUser, Issue, LancerWallet, User } from "@/src/types";
import { Tutorial } from "@/src/types/tutorials";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import { SolanaWallet } from "@web3auth/solana-provider";
import { Step } from "react-joyride";

export type LOGIN_STATE = "logged_out" | "logging_in" | "logged_in";

export type ISSUE_LOAD_STATE =
  | "initializing"
  | "getting_issue"
  | "getting_submitters"
  | "getting_contract"
  | "loaded";

export interface ILancerContext {
  currentUser: CurrentUser;
  issue: Issue;
  issues: Issue[];
  loginState: LOGIN_STATE;
  issueLoadingState: ISSUE_LOAD_STATE;
  program: Program<MonoProgram>;
  provider: AnchorProvider;
  currentWallet: LancerWallet;
  wallets: LancerWallet[];
  currentBounty: Bounty;
  currentAPIKey: APIKeyInfo;
  currentTutorialState: Tutorial;
  isRouterReady: boolean;
  isMobile: boolean;
  setCurrentTutorialState: (tutorial: Tutorial) => void;
  setCurrentAPIKey: (apiKey: APIKeyInfo) => void;
  setCurrentBounty: (bounty: Bounty) => void;
  setIssue: (issue: Issue) => void;
  setIssues: (issues: Issue[]) => void;
  setWallets: (wallets: LancerWallet[]) => void;
  setCurrentWallet: (wallets: LancerWallet) => void;
  setLoginState: (state: LOGIN_STATE) => void;
  setCurrentUser: (user: CurrentUser) => void;
  setIssueLoadingState: (state: ISSUE_LOAD_STATE) => void;
}

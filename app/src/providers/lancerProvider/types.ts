import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { Bounty, CurrentUser, Issue, User } from "@/src/types";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import { SolanaWallet } from "@web3auth/solana-provider";

export interface LancerWallet extends SolanaWalletContextState {
  signAndSendTransaction: (transaction: Transaction) => Promise<string>;
  signAllTransactions: (
    transactions: Transaction[]
  ) => Promise<Transaction[]>;
}

  export type LOGIN_STATE =
    | "logged_out"
    | "logging_in"
    | "logged_in"

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
        wallet: LancerWallet;
        currentBounty: Bounty;
        setCurrentBounty: (bounty:Bounty)=>void;
        setIssue: (issue: Issue) => void;
        setIssues: (issues: Issue[]) => void;
        setLoginState: (state: LOGIN_STATE) => void;
        setCurrentUser: (user: CurrentUser) => void;
        setIssueLoadingState: (state: ISSUE_LOAD_STATE) => void;
      }
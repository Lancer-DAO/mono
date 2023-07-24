import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { Bounty, CurrentUser, Issue, LancerWallet, User } from "@/src/types";
import { AnchorProvider, Program } from "@project-serum/anchor";

export type LOGIN_STATE = "logged_out" | "logging_in" | "logged_in";

export type ISSUE_LOAD_STATE =
  | "initializing"
  | "getting_issue"
  | "getting_submitters"
  | "getting_contract"
  | "loaded";

export interface IUserWalletContext {
  currentUser: CurrentUser;
  program: Program<MonoProgram>;
  provider: AnchorProvider;
  currentWallet: LancerWallet;
  logout?: () => void;
}

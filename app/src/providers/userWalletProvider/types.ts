import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { LancerWallet } from "@/types/";
import { User } from "@/types/Bounties";
import { AnchorProvider, Program } from "@project-serum/anchor";

export type LOGIN_STATE = "logged_out" | "logging_in" | "logged_in";

export type ISSUE_LOAD_STATE =
  | "initializing"
  | "getting_issue"
  | "getting_submitters"
  | "getting_contract"
  | "loaded";

export interface IUserWalletContext {
  currentUser: User;
  program: Program<MonoProgram>;
  provider: AnchorProvider;
  currentWallet: LancerWallet;
  logout?: () => void;
}

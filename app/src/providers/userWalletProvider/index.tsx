import { IS_CUSTODIAL } from "@/src/constants";
import { useContext } from "react";
import { CustodialWalletContext } from "./custodialProvider";
import { NonCustodialWalletContext } from "./nonCustodialProvider";
import { IUserWalletContext } from "./types";

export function useUserWallet(): IUserWalletContext {
  const context = IS_CUSTODIAL
    ? CustodialWalletContext
    : NonCustodialWalletContext;
  return useContext(context);
}

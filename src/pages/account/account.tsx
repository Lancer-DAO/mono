import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { fundFFA } from "@/src/onChain";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
import { DEFAULT_MINTS, DEFAULT_MINT_NAMES } from "@/src/pages/fund/form";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState } from "@/src/types";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  createMint,
  mintToChecked,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  createSyncNativeInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { PubKey } from "@/src/components";
import {
  CoinflowPurchase,
  SolanaWalletContextState,
} from "@coinflowlabs/react";
import { WalletContextState } from "@solana/wallet-adapter-react";
import Coinflow from "./coinflowOfframp";

const FundBounty: React.FC = () => {
  return (
    <div className="form" style={{ width: "1000px" }}>
      <Coinflow />
    </div>
  );
};

export default FundBounty;

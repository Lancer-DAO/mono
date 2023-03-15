import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { fundFFA } from "@/src/onChain";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
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
import { CoinflowPurchase } from "@coinflowlabs/react";

const Coinflow: React.FC<{
  transaction: Transaction;
  onSuccess: () => void;
  amount: number;
}> = ({ transaction, onSuccess, amount }) => {
  const { anchor, coinflowWallet } = useLancer();
  console.log(transaction);
  return (
    <div className="coinflow-wrapper">
      <CoinflowPurchase
        wallet={coinflowWallet}
        merchantId="lancer"
        connection={anchor.connection}
        blockchain={"solana"}
        transaction={transaction}
        onSuccess={onSuccess}
        debugTx={true}
        env="sandbox"
        amount={amount}
      />
    </div>
  );
};

export default Coinflow;

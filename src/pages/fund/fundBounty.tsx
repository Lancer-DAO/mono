import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { fundFFA } from "@/src/onChain";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState } from "@/src/types";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import Coinflow from "@/src/pages/bounty/components/coinflowPurchase";

const FundBounty: React.FC<{ amount: number }> = ({
  amount,
}: {
  amount: number;
}) => {
  const { wallet, anchor, program, setIssue, issue, coinflowWallet } =
    useLancer();

  const [fundTx, setFundTx] = useState<Transaction>(null);
  useEffect(() => {
    const getFundTransaction = async () => {
      console.log(
        "accounts#%",
        issue.creator.publicKey.toString(),
        issue.escrowContract.unixTimestamp
      );
      const tx = await fundFFA(
        issue.creator.publicKey,
        amount,
        issue.escrowContract,
        wallet,
        anchor,
        program
      );
      setFundTx(tx);
    };
    if (
      issue?.creator &&
      issue?.escrowContract?.unixTimestamp &&
      anchor &&
      wallet &&
      program
    ) {
      getFundTransaction();
    }
  }, [
    !!issue?.creator,
    !!issue?.escrowContract,
    !!anchor,
    !!wallet,
    !!program,
  ]);
  if (
    !issue ||
    !issue.escrowContract ||
    !wallet ||
    !anchor ||
    !coinflowWallet
  ) {
    return <></>;
  }

  const onSuccess = () => {
    axios.put(
      `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/funding_hash`,
      {
        org: issue.org,
        repo: issue.repo,
        issueNumber: issue.issueNumber,
        hash: "",
        amount: amount,
        mint: DEVNET_USDC_MINT,
      }
    );

    setIssue({
      ...issue,
      state: IssueState.ACCEPTING_APPLICATIONS,
    });
    window.location.replace(`/bounty?id=${issue.uuid}`);
  };
  return (
    <div className="bounty-fund-with-card">
      {fundTx && amount && (
        <Coinflow transaction={fundTx} onSuccess={onSuccess} amount={amount} />
      )}
    </div>
  );
};

export default FundBounty;

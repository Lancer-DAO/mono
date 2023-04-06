import { ISSUE_API_ROUTE, UPDATE_ISSUE_ROUTE } from "@/constants";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { fundFFA } from "@/escrow/adapters";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState, LancerWallet } from "@/src/types";
import { Connection, Transaction } from "@solana/web3.js";
import Coinflow from "@/src/pages/bounty/components/coinflowPurchase";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";

const FundBounty: React.FC<{ amount: number }> = ({
  amount,
}: {
  amount: number;
}) => {
  const { currentBounty, provider, wallet, program } = useLancer();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const router = useRouter();

  const [fundTx, setFundTx] = useState<Transaction>(null);
  useEffect(() => {
    const getFundTransaction = async () => {
      const transaction = await fundFFA(
        amount,
        currentBounty.escrow,
        wallet,
        program,
        provider
      );
      setFundTx(transaction);
    };
    getFundTransaction();
  }, []);

  const onSuccess = () => {
    fundB({
      bountyId: currentBounty.id,
      escrowId: currentBounty.escrow.id,
      mint: DEVNET_USDC_MINT,
      amount,
    });
    router.push(`/bounty?id=${currentBounty.id}`);
  };
  return (
    <div className="bounty-fund-with-card">
      {fundTx && amount && (
        <Coinflow
          transaction={fundTx}
          onSuccess={onSuccess}
          amount={amount}
          wallet={wallet}
          connection={provider.connection}
        />
      )}
    </div>
  );
};

export default FundBounty;

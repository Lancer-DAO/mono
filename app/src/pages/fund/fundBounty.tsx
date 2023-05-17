import { ISSUE_API_ROUTE, UPDATE_ISSUE_ROUTE } from "@/constants";
import { USDC_MINT } from "@/src/constants";
import { getFundFFATX } from "@/escrow/adapters";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import { BountyState, LancerWallet } from "@/src/types";
import { Connection, Transaction } from "@solana/web3.js";
import Coinflow from "@/src/pages/bounty/components/coinflowPurchase";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";

const FundBounty: React.FC<{ amount: number }> = ({
  amount,
}: {
  amount: number;
}) => {
  const { currentBounty, provider, currentWallet, program } = useLancer();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const router = useRouter();

  const [fundTx, setFundTx] = useState<Transaction>(null);
  useEffect(() => {
    const getFundTransaction = async () => {
      const transaction = await getFundFFATX(
        amount,
        currentBounty.escrow,
        currentWallet,
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
      mint: USDC_MINT,
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
          wallet={currentWallet}
          connection={provider.connection}
        />
      )}
    </div>
  );
};

export default FundBounty;

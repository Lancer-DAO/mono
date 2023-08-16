import { getFundFFATX } from "@/escrow/adapters";
import { useEffect, useState } from "react";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { LancerWallet } from "@/types/";
import { Connection, Transaction } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";
import { CoinflowPurchase } from "@coinflowlabs/react";
import { useBounty } from "@/src/providers/bountyProvider";

const FundBounty: React.FC<{ amount: number }> = ({
  amount,
}: {
  amount: number;
}) => {
  const { provider, currentWallet, program } = useUserWallet();
  const { currentBounty } = useBounty();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const router = useRouter();

  const [fundTx, setFundTx] = useState<Transaction>(null);
  useEffect(() => {
    const getFundTransaction = async () => {
      console.log("coinflow amount", amount);
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
  }, [amount]);

  const onSuccess = () => {
    fundB({
      bountyId: currentBounty.id,
      escrowId: currentBounty.escrow.id,
      amount,
    });
    router.push(`/bounties/${currentBounty.id}`);
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

const Coinflow: React.FC<{
  transaction: Transaction;
  onSuccess: () => void;
  amount: number;
  connection: Connection;
  wallet: LancerWallet;
}> = ({ transaction, onSuccess, amount, connection, wallet }) => {
  return (
    <div className="coinflow-wrapper">
      <CoinflowPurchase
        wallet={wallet}
        merchantId="lancer"
        connection={connection}
        blockchain={"solana"}
        transaction={transaction}
        onSuccess={onSuccess}
        debugTx={true}
        env="prod"
        amount={amount * 1.05}
      />
    </div>
  );
};

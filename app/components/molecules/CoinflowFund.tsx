import { getACHTransaction } from "@/escrow/adapters";
import { useEffect, useState } from "react";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { LancerWallet } from "@/types/";
import { Connection, Transaction } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";
import { CoinflowPurchase, SolanaWallet } from "@coinflowlabs/react";
import { useBounty } from "@/src/providers/bountyProvider";
import axios from "axios";

const FundBounty: React.FC<{ amount: number }> = ({ amount }) => {
  const { provider, currentWallet, program } = useUserWallet();
  const { currentBounty } = useBounty();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const router = useRouter();

  const [fundTx, setFundTx] = useState<Transaction>(null);
  useEffect(() => {
    const getFundTransaction = async () => {
      // console.log("coinflow amount", amount);
      const transaction = await getACHTransaction(
        amount,
        currentBounty?.escrow,
        currentWallet,
        program,
        provider
      );
      setFundTx(transaction);
    };
    getFundTransaction();
  }, [amount]);

  const onSuccess = async (args) => {
    console.log("onSuccess", args);
    console.log("parsed", JSON.parse(args));
    try {
      const {
        info: { paymentId },
      } = JSON.parse(args);
      fundB({
        bountyId: currentBounty?.id,
        escrowId: currentBounty?.escrow.id,
        amount,
        paymentId,
      });
      router.push(`/quests/${currentBounty?.id}`);
    } catch (error) {
      console.error(error);
      fundB({
        bountyId: currentBounty?.id,
        escrowId: currentBounty?.escrow.id,
        amount,
      });
      router.push(`/quests/${currentBounty?.id}`);
    }
  };

  return (
    <>
      {fundTx && amount && (
        <Coinflow
          transaction={fundTx}
          onSuccess={onSuccess}
          amount={amount}
          wallet={currentWallet}
          connection={provider.connection}
        />
      )}
    </>
  );
};

export default FundBounty;

const Coinflow: React.FC<{
  transaction: Transaction;
  onSuccess: (params: string) => void;
  amount: number;
  connection: Connection;
  wallet: LancerWallet;
}> = ({ transaction, onSuccess, amount, connection, wallet }) => {
  return (
    <div className="h-[600px] w-[600px]">
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

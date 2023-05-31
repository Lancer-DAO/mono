import { useLancer } from "@/src/providers/lancerProvider";
import { Transaction, Connection } from "@solana/web3.js";
import { CoinflowPurchase } from "@coinflowlabs/react";
import { SolanaWalletContextState } from "@coinflowlabs/react";
import { LancerWallet } from "@/src/types";

const Coinflow: React.FC<{
  transaction: Transaction;
  onSuccess: () => void;
  amount: number;
  connection: Connection;
  wallet: LancerWallet;
}> = ({ transaction, onSuccess, amount, connection, wallet }) => {
  // const { anchor, coinflowWallet } = useLancer();
  console.log(transaction);
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
        amount={amount}
      />
    </div>
  );
};

export default Coinflow;

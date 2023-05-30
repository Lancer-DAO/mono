import { useLancer } from "@/src/providers/lancerProvider";
import { CoinflowWithdraw } from "@coinflowlabs/react";

const Coinflow: React.FC = () => {
  const { provider, currentWallet } = useLancer();
  return (
    !!provider &&
    !!currentWallet && (
      <div className="coinflow-wrapper">
        <CoinflowWithdraw
          wallet={currentWallet}
          merchantId="lancer"
          connection={provider.connection}
          blockchain={"solana"}
          env="sandbox"
        />
      </div>
    )
  );
};

export default Coinflow;

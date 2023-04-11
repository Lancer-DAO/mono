import { useLancer } from "@/src/providers/lancerProvider";
import { CoinflowWithdraw } from "@coinflowlabs/react";

const Coinflow: React.FC = () => {
  const { provider, wallet } = useLancer();
  return (
    !!provider &&
    !!wallet && (
      <div className="coinflow-wrapper">
        <CoinflowWithdraw
          wallet={wallet}
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

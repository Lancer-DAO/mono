import { useUserWallet } from "@/src/providers/userWalletProvider";
import { CoinflowWithdraw } from "@coinflowlabs/react";

const CoinflowOfframp: React.FC = () => {
  const { provider, currentWallet } = useUserWallet();
  return (
    !!provider &&
    !!currentWallet && (
      <div className="coinflow-wrapper">
        <CoinflowWithdraw
          wallet={currentWallet}
          merchantId="lancer"
          connection={provider.connection}
          blockchain={"solana"}
          env="prod"
        />
      </div>
    )
  );
};

export default CoinflowOfframp;

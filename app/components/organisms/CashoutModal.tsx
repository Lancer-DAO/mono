import { useEffect, useState, FC, Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { fundFFA } from "@/escrow/adapters";
import { IS_CUSTODIAL, smallClickAnimation, USDC_MINT } from "@/src/constants";
import { CoinflowFund, USDC, CoinflowOfframp } from "@/components";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { IAsyncResult } from "@/types";
import toast from "react-hot-toast";
import { Modal } from "@/components";
import {
  TokenAccountNotFoundError,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { formatPrice, formatTwoDecimals } from "@/src/utils";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const CashoutModal: FC<Props> = ({ setShowModal }) => {
  const { currentWallet } = useUserWallet();
  const { connection } = useConnection();

  const [balance, setBalance] = useState<IAsyncResult<number>>({
    isLoading: true,
    loadingPrompt: "Loading Balance",
  });

  useEffect(() => {
    const getBalanceAsync = async () => {
      try {
        const usdcAccountAddress = getAssociatedTokenAddressSync(
          new PublicKey(USDC_MINT),
          currentWallet.publicKey
        );
        const usdcAccount = await getAccount(connection, usdcAccountAddress);
        const balance = parseFloat(usdcAccount.amount.toString()) / 10.0 ** 6;
        setBalance({ result: balance, isLoading: false });
      } catch (err) {
        if (err instanceof TokenAccountNotFoundError) {
          setBalance({ error: err, result: 0 });
        } else {
          console.error(err);
        }
      }
    };
    if (currentWallet.publicKey) {
      getBalanceAsync();
    }
  }, [currentWallet?.publicKey]);

  return (
    <Modal setShowModal={setShowModal} className="py-20">
      <div className="w-full px-10">
        <div className="w-full flex items-start justify-center gap-20">
          <div className="w-full flex flex-col gap-5 max-w-[400px]">
            <h1>Cashout</h1>
            <p>
              {`Balance: ${
                balance?.error
                  ? "$0.00"
                  : balance?.isLoading
                  ? "Loading"
                  : `${formatTwoDecimals(balance.result)} USDC`
              }`}{" "}
            </p>
            <p>Checkout to a Bank account (United States Only).</p>
          </div>
          {!balance?.error && (
            <div className="w-full min-w-[540px] px-10 flex flex-col items-center gap-10 bg-white pb-10 rounded-lg">
              <div className="w-full">
                <CoinflowOfframp />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CashoutModal;

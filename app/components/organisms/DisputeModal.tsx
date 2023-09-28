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
import { CreateDispute, SettleDispute } from "../quests/Quest/components";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const DisputeModal: FC<Props> = ({ setShowModal }) => {
  const { currentBounty } = useBounty();
  const [hasCreatedDispute, setHasCreatedDispute] = useState(false);

  return (
    <Modal setShowModal={setShowModal} className="py-20">
      <div className="w-full px-10 flex flex-col gap-4">
        <div className="w-full flex items-start justify-center gap-20">
          <div className="w-full flex flex-col gap-5 max-w-[400px]">
            <h1>Handle Dispute</h1>
            <p>{`Quest Value: ${currentBounty.escrow.amount}`}</p>
          </div>
        </div>
        <CreateDispute setHasCreatedDispute={setHasCreatedDispute} />
        {hasCreatedDispute && <SettleDispute />}
      </div>
    </Modal>
  );
};

export default DisputeModal;

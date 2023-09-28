import { useEffect, useState, FC, Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { fundFFA, fundFFATXGasless } from "@/escrow/adapters";
import { IS_CUSTODIAL, smallClickAnimation } from "@/src/constants";
import { CoinflowFund, USDC } from "@/components";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { IAsyncResult } from "@/types";
import toast from "react-hot-toast";
import { Modal } from "@/components";
import { useMint } from "@/src/providers/mintProvider";
import Image from "next/image";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  amount?: number;
}

const FundQuestModal: FC<Props> = ({ setShowModal, amount }) => {
  const { currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const { allMints } = useMint();
  const [fundQuestState, setFundQuestState] = useState<IAsyncResult<string>>({
    isLoading: false,
  });
  const [fundingType, setFundingType] = useState<"wallet" | "card">(
    IS_CUSTODIAL ? "card" : "wallet"
  );

  const onClick = async () => {
    const toastId = toast.loading("Funding Quest...");
    setFundQuestState({
      isLoading: true,
      loadingPrompt: "Sending Funds to Escrow",
    });

    if (
      currentTutorialState?.title ===
        CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 7
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }
    try {
      await fundFFATXGasless(
        amount,
        currentBounty?.escrow,
        currentWallet,
        program,
        provider,
        currentBounty?.escrow.mint.decimals,
        new PublicKey(currentBounty?.escrow.mint.publicKey)
      );
      const bounty = await fundB({
        bountyId: currentBounty?.id,
        escrowId: currentBounty?.escrow.id,
        amount: amount,
      });
      toast.success("Quest funded!", { id: toastId });
      setCurrentBounty(bounty);
      setShowModal(false);
    } catch (error) {
      console.log("error funding Quest: ", error);
      toast.error("Error funding Quest", { id: toastId });
      setFundQuestState({ error });
    }
  };

  const handlePrice = () => {
    if (!amount) return;
    if (amount.toString.length > 5) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(1.05 * amount);
    } else {
      return (1.05 * amount).toFixed(2);
    }
  };

  const handleFee = () => {
    if (!amount) return;
    if (amount.toString().length > 5) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(0.05 * amount);
    } else {
      return (0.05 * amount).toFixed(2);
    }
  };

  useEffect(() => {
    if (
      currentTutorialState?.title ===
        CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 5
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: true,
        currentStep: 6,
      });
    }
  }, []);

  return (
    <Modal setShowModal={setShowModal} className="pt-10">
      <div className="relative w-full p-5">
        <div className="w-[900] flex items-start justify-center gap-10">
          <div className="w-full flex flex-col gap-5 max-w-[400px]">
            <h1>Funding Details</h1>
            <p>
              This initial deposit shows your commitment to the Quest and will
              be held in escrow until the Quest is completed or canceled.
            </p>
            <p>
              By proceeding you are agreeing to Lancer&apos;s Terms of Service.
            </p>
          </div>
          <div className="w-full p-5 flex flex-col items-center gap-5 bg-white rounded-md">
            {!IS_CUSTODIAL && (
              <div className="w-full h-10 flex items-center justify-evenly">
                <motion.button
                  {...smallClickAnimation}
                  className={`w-full flex items-center justify-center ${
                    fundingType === "wallet"
                      ? "font-bold text-textLancerGreen"
                      : "font-base"
                  }`}
                  onClick={() => setFundingType("wallet")}
                >
                  Pay with Crypto
                </motion.button>
                <motion.button
                  {...smallClickAnimation}
                  className={`w-full flex items-center justify-center ${
                    fundingType === "card"
                      ? "font-bold text-textLancerGreen"
                      : "font-base"
                  }`}
                  onClick={() => setFundingType("card")}
                >
                  Pay with Fiat
                </motion.button>
              </div>
            )}
            {fundingType === "card" && (
              <div className="w-full">
                <div className="w-full pb-5">
                  <p className="w-full mb-2">Price</p>
                  <input
                    type="number"
                    className="placeholder:text-textGreen/70 border bg-neutralBtn
                    border-neutralBtnBorder w-full h-[50px] rounded-lg px-3
                    disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    name="issuePrice"
                    placeholder={`$2500`}
                    disabled={!allMints}
                    value={amount}
                  />
                </div>
                {amount && <CoinflowFund amount={amount} />}
              </div>
            )}
            {fundingType === "wallet" && (
              <div className="w-full flex flex-col items-center gap-5">
                <div className="w-full">
                  <p className="w-full my-2 font-bold text-center">
                    Deposit price for your Quest:
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      className="placeholder:text-textGreen/70 border bg-neutralBtn
                      border-neutralBtnBorder w-full h-[50px] rounded-lg px-3
                      disabled:opacity-50 disabled:cursor-not-allowed text-center"
                      name="issuePrice"
                      disabled={!allMints}
                      value={amount}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <USDC height="25px" width="25px" />
                    </div>
                  </div>
                </div>
                {amount && allMints && (
                  <div className="w-full flex flex-col gap-2">
                    <p className="w-full text">
                      Set Price:{" "}
                      <span className="font-bold">
                        {amount} {allMints[0]?.ticker}
                      </span>
                    </p>
                    <p className="w-full text">
                      Matching Fee:{" "}
                      <span className="font-bold">
                        {handleFee()} {allMints[0]?.ticker}
                      </span>
                    </p>
                    <p className="w-full text">
                      Total Cost:{" "}
                      <span className="font-bold">
                        {handlePrice()} {allMints[0]?.ticker}
                      </span>
                    </p>
                  </div>
                )}
                <motion.button
                  {...smallClickAnimation}
                  disabled={!amount}
                  onClick={() => onClick()}
                  className={`bg-secondary200 h-9 w-full px-4 py-2
                  title-text rounded-md text-white disabled:cursor-not-allowed disabled:opacity-80
                  ${fundQuestState.error ? " bg-neutral100 text-error" : ""} `}
                >
                  {fundQuestState.error
                    ? "Failed to Fund Escrow"
                    : fundQuestState.isLoading
                    ? fundQuestState.loadingPrompt
                    : "Send Funds to Escrow"}
                </motion.button>
              </div>
            )}
          </div>
        </div>
        <Image
          src="/assets/images/knight_left.png"
          width={300}
          height={300}
          alt="knight"
          className="absolute left-0 bottom-0"
        />
      </div>
    </Modal>
  );
};

export default FundQuestModal;

import { useEffect, useState, FC, Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { fundFFA } from "@/escrow/adapters";
import { IS_CUSTODIAL, smallClickAnimation } from "@/src/constants";
import { CoinflowFund, USDC } from "@/components";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { IAsyncResult } from "@/types";
import toast from "react-hot-toast";
import { Modal } from "@/components";
import { useMint } from "@/src/providers/mintProvider";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setIsFunded?: Dispatch<SetStateAction<boolean>>;
}

const FundBountyModal: FC<Props> = ({ setShowModal, setIsFunded }) => {
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

  const [issuePrice, setIssuePrice] = useState<string>(
    currentBounty?.price?.toString()
  );

  const handleChange = (event) => {
    setIssuePrice(event.target.value);
  };

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
      await fundFFA(
        parseFloat(issuePrice),
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
        amount: parseFloat(issuePrice),
      });
      setIsFunded && setIsFunded(true);
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
    if (!issuePrice) return;
    if (issuePrice.length > 5) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(1.05 * parseFloat(issuePrice));
    } else {
      return (1.05 * parseFloat(issuePrice)).toFixed(2);
    }
  };

  const handleFee = () => {
    if (!issuePrice) return;
    if (issuePrice.length > 5) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(0.05 * parseFloat(issuePrice));
    } else {
      return (0.05 * parseFloat(issuePrice)).toFixed(2);
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
    <Modal setShowModal={setShowModal} className="py-20">
      <div className="w-full px-10">
        <div className="w-full flex items-start justify-center gap-20">
          <div className="w-full flex flex-col gap-5 max-w-[400px]">
            <h1>Funding Details</h1>
            <p>
              Deposit the total value of the quest and fund your secure escrow
              account. You’ll be able to approve or deny the sending of funds.
              By proceeding you are agreeing to Lancer’s terms of service.
            </p>
          </div>
          <div className="w-full max-w-[540px] px-10 flex flex-col items-center gap-10 bg-white pb-10 rounded-lg">
            {!IS_CUSTODIAL && (
              <div className="w-full h-10 flex items-center justify-evenly mt-2">
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
                  className={`w-full h-10 flex items-center justify-center ${
                    fundingType === "card"
                      ? "font-bold text-textLancerGreen"
                      : "font-base"
                  }`}
                  onClick={() => setFundingType("card")}
                >
                  Pay with Credit Card
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
                    value={issuePrice}
                    onChange={handleChange}
                  />
                </div>
                {issuePrice && (
                  <CoinflowFund amount={parseInt(issuePrice) || 0} />
                )}
              </div>
            )}
            {fundingType === "wallet" && (
              <div className="w-full flex flex-col items-center gap-5">
                <div className="w-full">
                  <p className="w-full my-2 font-bold">
                    Set a Price for Your Quest
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      className="placeholder:text-textGreen/70 border bg-neutralBtn
                      border-neutralBtnBorder w-full h-[50px] rounded-lg px-3
                      disabled:opacity-50 disabled:cursor-not-allowed text-center"
                      name="issuePrice"
                      placeholder={`$2500`}
                      disabled={!allMints}
                      value={issuePrice}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <USDC height="25px" width="25px" />
                    </div>
                  </div>
                </div>
                {issuePrice && allMints && (
                  <>
                    <p className="w-full">
                      Set Price:{" "}
                      <span className="font-bold">
                        {issuePrice} {allMints[0]?.ticker}
                      </span>
                    </p>
                    <p className="w-full">
                      Matching Fee:{" "}
                      <span className="font-bold">
                        {handleFee()} {allMints[0]?.ticker}
                      </span>
                    </p>
                    <p className="w-full">
                      Total Cost:{" "}
                      <span className="font-bold">
                        {handlePrice()} {allMints[0]?.ticker}
                      </span>
                    </p>
                  </>
                )}
                <motion.button
                  {...smallClickAnimation}
                  disabled={!issuePrice}
                  onClick={() => onClick()}
                  className={`border h-[50px] rounded-lg text-base w-full 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    fundQuestState.error
                      ? " bg-secondaryBtn border-secondaryBtnBorder text-textRed"
                      : " bg-primaryBtn border-primaryBtnBorder text-textGreen"
                  } `}
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
      </div>
    </Modal>
  );
};

export default FundBountyModal;

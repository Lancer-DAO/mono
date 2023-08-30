import { useEffect, useState, FC, Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { PublicKey } from "@solana/web3.js";
import { api } from "@/src/utils/api";
import { fundFFA } from "@/escrow/adapters";
import {
  BONK_DEMICALS,
  BONK_MINT,
  IS_CUSTODIAL,
  IS_MAINNET,
  USDC_DECIMALS,
  USDC_MINT,
  smallClickAnimation,
} from "@/src/constants";
import { USDC } from "@/components/@icons";
import { FundBounty } from "@/components/molecules";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { FORM_SECTION, FormData, IAsyncResult } from "@/types";
import { Mint } from "@prisma/client";
import toast from "react-hot-toast";

interface Props {
  isAccountCreated: boolean;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  mint: Mint;
}

export const FundBountyForm: FC<Props> = ({
  isAccountCreated,
  formData,
  setFormData,
  setFormSection,
  mint,
}) => {
  const { currentWallet, currentUser, program, provider } = useUserWallet();
  const { currentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const [fundQuestState, setFundQuestState] = useState<IAsyncResult<string>>({
    isLoading: false,
  });
  const [fundingType, setFundingType] = useState<"wallet" | "card">(
    IS_CUSTODIAL ? "card" : "wallet"
  );

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
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
        parseFloat(formData?.issuePrice),
        currentBounty?.escrow,
        currentWallet,
        program,
        provider,
        currentBounty?.escrow.mint.decimals,
        new PublicKey(currentBounty?.escrow.mint.publicKey)
      );
      await fundB({
        bountyId: currentBounty?.id,
        escrowId: currentBounty?.escrow.id,
        amount: parseFloat(formData.issuePrice),
      });
      toast.success("Quest funded!", { id: toastId });
      setFormSection("SUCCESS");
    } catch (error) {
      console.log("error funding Quest: ", error);
      toast.error("Error funding Quest", { id: toastId });
      setFundQuestState({ error });
    }
  };

  const handlePrice = () => {
    if (!formData.issuePrice) return;
    if (formData.issuePrice.length > 5) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(1.05 * parseFloat(formData.issuePrice));
    } else {
      return (1.05 * parseFloat(formData.issuePrice)).toFixed(2);
    }
  };

  const handleFee = () => {
    if (!formData.issuePrice) return;
    if (formData.issuePrice.length > 5) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(0.05 * parseFloat(formData.issuePrice));
    } else {
      return (0.05 * parseFloat(formData.issuePrice)).toFixed(2);
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
    <div className="w-full px-10">
      <div className="w-full flex items-start justify-center mt-10 gap-20">
        <div className="w-full flex flex-col gap-5 max-w-[400px]">
          <h1>Funding Details</h1>
          <p>
            You’re almost done! Last step is to deposit the total value of the
            quest and fund your secure escrow account. You’ll be able to approve
            or deny the sending of funds. By proceeding you are agreeing to
            Lancer’s terms of service.
          </p>
        </div>
        <div className="w-full max-w-[540px] px-10 flex flex-col items-center gap-10 bg-white pb-10">
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
                  name="fundingAmount"
                  placeholder={`$2500`}
                  disabled={!mint}
                  // disabled={toggleConfig.selected === "option2"}
                  value={formData?.issuePrice}
                  onChange={handleChange}
                />
              </div>
              {formData.issuePrice && (
                <FundBounty amount={parseInt(formData.issuePrice) || 0} />
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
                    disabled={!mint}
                    // disabled={toggleConfig.selected === "option2"}
                    value={formData?.issuePrice}
                    onChange={handleChange}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <USDC height="25px" width="25px" />
                  </div>
                </div>
              </div>
              {formData.issuePrice && (
                <>
                  <p className="w-full">
                    Set Price:{" "}
                    <span className="font-bold">
                      {formData.issuePrice} {mint?.ticker}
                    </span>
                  </p>
                  <p className="w-full">
                    Marketplace Fee:{" "}
                    <span className="font-bold">
                      {handleFee()} {mint?.ticker}
                    </span>
                  </p>
                  <p className="w-full">
                    Total Cost:{" "}
                    <span className="font-bold">
                      {handlePrice()} {mint?.ticker}
                    </span>
                  </p>
                </>
              )}
              <motion.button
                {...smallClickAnimation}
                onClick={() => onClick()}
                className={`border h-[50px] rounded-lg text-base w-full ${
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
  );
};

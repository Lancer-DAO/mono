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
import { CoinflowFund, MintsDropdown } from "@/components";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { FORM_SECTION, FormData, Option } from "@/types";
import { Mint } from "@prisma/client";

interface Props {
  isAccountCreated: boolean;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  mints: Mint[];
}

const Form: FC<Props> = ({
  isAccountCreated,
  formData,
  setFormData,
  setFormSection,
  mints,
}) => {
  const { currentWallet, currentUser, program, provider } = useUserWallet();
  const { currentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync: getBounty } = api.bounties.getBounty.useMutation();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();

  const [fundingType, setFundingType] = useState<"wallet" | "card">(
    IS_CUSTODIAL ? "card" : "wallet"
  );
  const [mint, setMint] = useState<Mint>();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const onClick = async () => {
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
    setFormSection("PREVIEW");
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

  const handleChangeMint = (mint: Mint) => {
    const newMint = mints.find((_mint) => _mint.name === mint.name);
    setMint(newMint);
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
    <div className="w-full">
      <div className="w-full flex items-start justify-center mt-10 gap-20">
        <div className="w-full flex flex-col gap-5 max-w-[400px]">
          <h1>Funding Details</h1>
          <p>
            By funding an issue with Lancer, you are outsourcing a developer
            task in one of two ways. The first is internally to your team or a
            free-lancer and the other is a public bounty to our network of
            developers. The more clear you are with your descriptions, the
            better Lancer is at finding the right developer to solve your issue.
          </p>
          <motion.button
            {...smallClickAnimation}
            onClick={() => setFormSection("MEDIA")}
            className="bg-secondaryBtn border border-secondaryBtnBorder text-textRed 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            BACK
          </motion.button>
        </div>
        <div className="w-full max-w-[540px] px-10 flex flex-col items-center gap-10 bg-white pb-10">
          {!IS_CUSTODIAL && (
            <div className="w-full h-10 flex items-center justify-evenly py-2">
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
            <>
              <div>
                <label>Funding Amount</label>
                <div>
                  <input
                    type="number"
                    className="input w-input"
                    name="fundingAmount"
                    placeholder="1000 (USD)"
                    id="Issue"
                    value={formData.issuePrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {formData.issuePrice && (
                <CoinflowFund amount={parseInt(formData.issuePrice) || 0} />
              )}
            </>
          )}
          {fundingType === "wallet" && (
            <div className="w-full flex flex-col items-center gap-5">
              <MintsDropdown
                options={mints}
                selected={mint}
                onChange={handleChangeMint}
              />
              <div className="w-full">
                <p className="w-full mb-2">Price</p>
                <input
                  type="number"
                  className="placeholder:text-textGreen/70 border bg-neutralBtn
                  border-neutralBtnBorder w-full h-[50px] rounded-lg px-3
                  disabled:opacity-50 disabled:cursor-not-allowed text-center"
                  name="issuePrice"
                  placeholder={`2500`}
                  disabled={!mint}
                  // disabled={toggleConfig.selected === "option2"}
                  value={formData?.issuePrice}
                  onChange={handleChange}
                />
              </div>
              {formData.issuePrice && (
                <div className="w-full">
                  Total Cost:{" "}
                  <span className="font-bold">
                    {handlePrice()} {mint?.ticker}
                  </span>
                </div>
              )}
              <motion.button
                {...smallClickAnimation}
                onClick={() => onClick()}
                disabled={!mint || !formData.issuePrice}
                className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
                w-full h-[50px] rounded-lg text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send funds to escrow
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;

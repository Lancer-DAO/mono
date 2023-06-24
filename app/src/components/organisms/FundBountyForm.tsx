import { useEffect, useState } from "react";

import { BountyState, LancerWallet } from "@/src/types";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "next/router";
import { api } from "@/src/utils/api";
import { currentUser } from "@/server/api/routers/users/currentUser";
import classNames from "classnames";
import { fundFFA, getFundFFATX } from "@/escrow/adapters";
import { USDC_MINT } from "@/src/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { CoinflowFund } from "@/src/components";

const Form: React.FC<{ isAccountCreated: boolean }> = ({
  isAccountCreated,
}) => {
  const {
    currentBounty,
    currentUser,
    setCurrentBounty,
    program,
    provider,
    currentWallet,
  } = useLancer();
  const [fundingType, setFundingType] = useState<"wallet" | "card">("wallet");

  const { mutateAsync: getBounty } = api.bounties.getBounty.useMutation();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fundingAmount: null,
  });
  useEffect(() => {
    // if (isTutorialActive) {
    //   setIsTutorialRunning(true);
    // }
  }, []);
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const onClick = async () => {
    // setIsTutorialRunning(false);
    // If we are the creator, then skip requesting and add self as approved
    const signature = await fundFFA(
      formData.fundingAmount,
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    await fundB({
      bountyId: currentBounty.id,
      escrowId: currentBounty.escrow.id,
      mint: USDC_MINT,
      amount: parseFloat(formData.fundingAmount),
    });
    router.push(`/bounty?id=${currentBounty.id}`);
  };

  return (
    currentBounty && (
      <div className="form-container">
        <div className="form">
          <>
            <div id="job-information" className="form-layout-flex">
              <h2
                id="w-node-a3d1ad77-e5aa-114b-bcd7-cde3db1bb746-0ae9cdc2"
                className="form-subtitle"
              >
                Fund Lancer Bounty
              </h2>
              <div className="issue-creation-type">
                <div
                  className={classnames("form-subtitle hover-effect", {
                    unselected: fundingType !== "wallet",
                  })}
                  onClick={() => setFundingType("wallet")}
                >
                  Fund with Wallet
                </div>
                <div>OR</div>
                <div
                  className={classnames("form-subtitle hover-effect", {
                    unselected: fundingType !== "card",
                  })}
                  onClick={() => setFundingType("card")}
                >
                  Fund with Card
                </div>
              </div>
              {/* {!isAccountCreated ? (
                <LoadingBar title="Loading On Chain Details" />
              ) : ( */}
              <>
                {fundingType === "card" && (
                  <>
                    <div>
                      <label>
                        Funding Amount<span className="color-red">*</span>
                      </label>
                      <div>
                        <input
                          type="number"
                          className="input w-input"
                          name="fundingAmount"
                          placeholder="1000 (USD)"
                          id="Issue"
                          value={formData.fundingAmount}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    {formData.fundingAmount && (
                      <CoinflowFund
                        amount={parseInt(formData.fundingAmount || 0)}
                      />
                    )}
                  </>
                )}
                {fundingType === "wallet" && (
                  <>
                    <div>
                      <label>
                        Funding Amount<span className="color-red">*</span>
                      </label>
                      <div>
                        <input
                          type="number"
                          className="input w-input"
                          name="fundingAmount"
                          placeholder="1000 (USD)"
                          id="issue-amount-input"
                          value={formData.fundingAmount}
                          onChange={handleChange}
                          onBlur={() => {
                            // if (
                            //   isTutorialActive &&
                            //   formData.fundingAmount > 0
                            // ) {
                            //   setIsTutorialRunning(true);
                            //   setCurrentTutorialStep(1);
                            // }
                          }}
                          onMouseLeave={() => {
                            // if (
                            //   isTutorialActive &&
                            //   formData.fundingAmount > 0
                            // ) {
                            //   setIsTutorialRunning(true);
                            //   setCurrentTutorialStep(1);
                            // }
                          }}
                          onFocus={() => {
                            // if (isTutorialActive) {
                            //   setIsTutorialRunning(false);
                            // }
                          }}
                        />
                      </div>
                    </div>
                    {formData.fundingAmount && (
                      <div>Total Cost: {1.05 * formData.fundingAmount}</div>
                    )}
                    <button
                      className={classNames("button-primary", {
                        disabled: !formData.fundingAmount,
                      })}
                      onClick={onClick}
                      id="issue-funding-submit"
                    >
                      Submit
                    </button>
                  </>
                )}
              </>
              {/* )} */}
            </div>
          </>
        </div>
      </div>
    )
  );
};

export default Form;

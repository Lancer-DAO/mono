import { useEffect, useState } from "react";

import { BountyState, LancerWallet } from "@/src/types";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import FundBounty from "./fundBounty";
import { LoadingBar } from "@/src/components/atoms/LoadingBar";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "next/router";
import { api } from "@/src/utils/api";
import { currentUser } from "@/server/api/routers/users/currentUser";
import classNames from "classnames";
import { fundFFA, getFundFFATX } from "@/escrow/adapters";
import { USDC_MINT } from "@/src/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

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
  const { mutateAsync: getBounty } = api.bounties.getBounty.useMutation();
  const { mutateAsync: fundB } = api.bounties.fundBounty.useMutation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fundingAmount: null,
  });
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const onClick = async () => {
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
              {/* {!isAccountCreated ? (
                <LoadingBar title="Loading On Chain Details" />
              ) : ( */}
              <>
                {currentWallet.providerName === "Magic Link" && (
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
                      <FundBounty
                        amount={parseInt(formData.fundingAmount || 0)}
                      />
                    )}
                  </>
                )}
                {currentWallet.providerName !== "Magic Link" && (
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
                    <button
                      className={classNames("button-primary", {
                        disabled: !formData.fundingAmount,
                      })}
                      onClick={onClick}
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

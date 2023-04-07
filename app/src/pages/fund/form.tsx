import { useEffect, useState } from "react";

import { IssueState } from "@/src/types";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import FundBounty from "./fundBounty";
import { LoadingBar } from "@/src/components/LoadingBar";
import { PublicKey } from "@solana/web3.js";
import { useRouter } from "next/router";
import { api } from "@/src/utils/api";
import { currentUser } from "@/server/api/routers/users/currentUser";

const Form = () => {
  const { currentBounty, currentUser, setCurrentBounty } = useLancer();
  const { mutateAsync: getBounty } = api.bounties.getBounty.useMutation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fundingAmount: null,
  });
  const [isAccountCreated, setIsAccountCreated] = useState(true);
  const [fundingType, setFundingType] = useState<"card" | "wallet">("card");
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  useEffect(() => {
    if (router.isReady) {
      const getB = async () => {
        const bounty = await getBounty({
          id: parseInt(router.query.id as string),
          currentUserId: currentUser.id,
        });
        setCurrentBounty(bounty);
      };
      getB();
    }
  }, [router.isReady]);
  // useEffect(() => {
  //   provider &&
  //     currentBounty &&
  //     provider.connection.onAccountChange(
  //       new PublicKey(currentBounty.escrow.publicKey),
  //       (callback) => {
  //         console.log(callback);
  //         setIsAccountCreated(true);
  //       }
  //     );
  // }, [currentBounty?.escrow.publicKey, provider]);

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
              {!isAccountCreated ? (
                <LoadingBar title="Loading On Chain Details" />
              ) : (
                <>
                  <div className="issue-creation-type">
                    <div
                      className={classnames("form-subtitle hover-effect", {
                        unselected: fundingType !== "card",
                      })}
                      onClick={() => setFundingType("card")}
                    >
                      Pay With Card
                    </div>
                    <div>OR</div>
                    <div
                      className={classnames("form-subtitle hover-effect", {
                        unselected: fundingType !== "wallet",
                        disabled: true,
                      })}
                      onClick={() => setFundingType("wallet")}
                    >
                      Pay With Phantom Wallet (Coming Soon)
                    </div>
                  </div>

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
                        <FundBounty
                          amount={parseInt(formData.fundingAmount || 0)}
                        />
                      )}
                    </>
                  )}
                  {fundingType === "wallet" && <></>}
                </>
              )}
            </div>
          </>
        </div>
      </div>
    )
  );
};

export default Form;

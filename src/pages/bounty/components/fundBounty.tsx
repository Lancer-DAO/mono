import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { fundFFA } from "@/src/onChain";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useState } from "react";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
import { DEFAULT_MINTS, DEFAULT_MINT_NAMES } from "@/src/pages/fund/form";
import { useLancer } from "@/src/providers/lancerProvider";

const FundBounty: React.FC = () => {
  const { wallet, anchor, program, user, issue } = useLancer();
  if (!issue) {
    return <></>;
  }

  const [formData, setFormData] = useState({
    paymentType: "spl",
    paymentAmount: 0,
    mintAddress: "",
  });

  const fundFeature = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    debugger;
    const signature = await fundFFA(
      issue.creator.pubkey,
      formData.paymentAmount,
      issue.escrowKey,
      wallet,
      anchor,
      program
    );

    axios.put(
      `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/funding_hash`,
      {
        org: issue.org,
        repo: issue.repo,
        issueNumber: issue.issueNumber,
        hash: signature,
        amount: formData.paymentAmount,
        mint: DEVNET_USDC_MINT,
      }
    );
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  return (
    <form className="form" style={{ width: "1000px" }} onSubmit={fundFeature}>
      <div className="form-subtitle">Payment Information</div>
      <div className="form-row-grid grid-1-1-1">
        <div className="form-cell">
          <label className="form-label">Payment Type</label>
          <select
            name="paymentType"
            value={formData.paymentType}
            onChange={handleChange}
            className="form-select"
          >
            <option value="spl">SPL Token</option>
            <option value="stripe" disabled={true}>
              Stripe (Coming Soon)
            </option>
            <option value="paypal" disabled={true}>
              PayPal (Coming Soon)
            </option>
            <option value="coinbase" disabled={true}>
              Coinbase (Coming Soon)
            </option>
          </select>
        </div>
        <div className="form-cell">
          <label className="form-label">Payment Token</label>
          <RadioWithCustomInput
            options={[...DEFAULT_MINTS.map((mint) => mint.name), "Other"]}
            defaultOption="SOL"
            setOption={(option) => {
              const mintAddress = DEFAULT_MINT_NAMES.includes(option)
                ? DEFAULT_MINTS.find((mint) => mint.name === option).mint
                : option;
              setFormData({
                ...formData,
                mintAddress: mintAddress,
              });
            }}
          />
        </div>
        <div className="form-cell">
          <label className="form-label">Payment Amount</label>
          <input
            type="number"
            name="paymentAmount"
            value={formData.paymentAmount}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>
      <div className="submit-wrapper">
        <button type="submit" className="form-submit">
          Submit
        </button>
      </div>
    </form>
  );
};

export default FundBounty;

import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { fundFFA } from "@/src/onChain";
import { getApiEndpoint } from "@/src/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
import { DEFAULT_MINTS, DEFAULT_MINT_NAMES } from "@/src/pages/fund/form";
import { useLancer } from "@/src/providers/lancerProvider";
import { IssueState } from "@/src/types";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  createMint,
  mintToChecked,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  createSyncNativeInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { PubKey } from "@/src/components";

const FundBounty: React.FC = () => {
  const { wallet, anchor, program, setIssue, issue, user } = useLancer();
  const [formData, setFormData] = useState({
    paymentType: "spl",
    paymentAmount: 0,
    mintAddress: DEVNET_USDC_MINT,
  });
  const [userBalance, setUserBalance] = useState("0.0");
  useEffect(() => {
    const getWalletBalance = async () => {
      const mintKey = new PublicKey(formData.mintAddress);
      const token_account = await getAssociatedTokenAddress(
        mintKey,
        user.publicKey
      );
      const account = await getAccount(anchor.connection, token_account);
      const mint = await getMint(anchor.connection, mintKey);
      const decimals = Math.pow(10, mint.decimals);
      console.log(account.amount);
      const balance = account.amount / BigInt(decimals);
      setUserBalance(balance.toString());
    };
    if (user?.publicKey && anchor?.connection) {
      getWalletBalance();
    }
  }, [user?.publicKey, formData.mintAddress, anchor]);
  if (!issue || !issue.escrowContract) {
    return <></>;
  }

  const fundFeature = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const signature = await fundFFA(
      issue.creator.pubkey,
      formData.paymentAmount,
      issue.escrowContract,
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
        hash: signature.signature,
        amount: formData.paymentAmount,
        mint: DEVNET_USDC_MINT,
      }
    );

    setIssue({
      ...issue,
      state: IssueState.ACCEPTING_APPLICATIONS,
    });
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  return (
    <form className="form" style={{ width: "1000px" }} onSubmit={fundFeature}>
      <div className="User Balance">User Balance: {userBalance}</div>
      <PubKey pubKey={user.publicKey} />
      <a
        href="https://staging.coinflow.cash/faucet"
        target={"_blank"}
        rel="noreferrer"
      >
        Request Airdrop
      </a>
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

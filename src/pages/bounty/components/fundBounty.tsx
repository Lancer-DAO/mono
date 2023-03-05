import {
  ACCOUNT_API_ROUTE,
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { REACT_APP_CLIENTID } from "@/src/constants";
import {
  addSubmitterFFA,
  approveRequestFFA,
  cancelFFA,
  denyRequestFFA,
  fundFFA,
  getFeatureFundingAccount,
  removeSubmitterFFA,
  submitRequestFFA,
  voteToCancelFFA,
} from "@/src/onChain";
import {
  IWeb3AuthContext,
  REACT_APP_AUTH0_DOMAIN,
  useWeb3Auth,
} from "@/src/providers";
import {
  convertToQueryParams,
  getApiEndpoint,
  getEndpoint,
  getMintName,
  getSolscanAddress,
} from "@/src/utils";
import { Issue, IssueState, WEB3_INIT_STATE } from "@/types";
import { Connection, PublicKey } from "@solana/web3.js";
import { WALLET_ADAPTERS } from "@web3auth/base";
import axios from "axios";
import { capitalize } from "lodash";
import { marked } from "marked";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import Base58 from "base-58";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
import { DEFAULT_MINTS, DEFAULT_MINT_NAMES } from "@/src/pages/fund/form";

interface Props {
  issue: Issue;
  web3auth: IWeb3AuthContext;
}

const SideBarSection: React.FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <div className="side-bar-section">
      <h3 className="side-bar-section-title">{title}</h3>
      {children}
    </div>
  );
};

const FundBounty: React.FC<Props> = ({ issue, web3auth }) => {
  const {
    provider,
    loginRWA,
    getUserInfo,
    signAndSendTransaction,
    setIsLoading,
    isWeb3AuthInit,
    getBalance,
    getAccounts,
    logout,
    getWallet,
  } = web3auth;
  const [user, setUser] = useState<PublicKey>();
  const search = useLocation().search;
  const creator = new PublicKey(issue.pubkey);
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const token = jwt == null ? "" : jwt;
  const [web3AuthState, setWeb3AuthState] = useState(
    WEB3_INIT_STATE.GETTING_TOKEN
  );

  const [formData, setFormData] = useState({
    paymentType: "spl",
    paymentAmount: 0,
    mintAddress: "",
  });
  const ffa = issue.escrowKey ? new PublicKey(issue.escrowKey) : undefined;

  const fundFeature = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const wallet = getWallet();
    const connection = new Connection(getEndpoint());

    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program<MonoProgram>(
      MonoProgramJSON as unknown as MonoProgram,
      new PublicKey(MONO_DEVNET),
      provider
    );
    const accounts = await connection.getParsedProgramAccounts(
      program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      {
        filters: [
          {
            dataSize: 288, // number of bytes
          },
          {
            memcmp: {
              offset: 8, // number of bytes
              bytes: creator.toBase58(), // base58 encoded string
            },
          },
          {
            memcmp: {
              offset: 275, // number of bytes
              bytes: Base58.encode(Buffer.from(issue.timestamp)), // base58 encoded string
            },
          },
        ],
      }
    );

    const escrowKey = accounts[0].pubkey;

    console.log("escrow", escrowKey.toString());
    await axios.put(
      `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/escrow_key`,
      {
        org: issue.org,
        repo: issue.repo,
        issueNumber: issue.issueNumber,
        escrowKey: escrowKey.toString(),
      }
    );

    const signature = await fundFFA(
      creator,
      formData.paymentAmount,
      escrowKey,
      signAndSendTransaction,
      getWallet
    );

    axios.put(
      `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/funding_hash`,
      {
        org: issue.org,
        repo: issue.repo,
        issueNumber: issue.issueNumber,
        hash: signature,
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

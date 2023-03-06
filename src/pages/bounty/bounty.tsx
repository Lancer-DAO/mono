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
import { REACT_APP_AUTH0_DOMAIN, useWeb3Auth } from "@/src/providers";
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
import { useLancer } from "@/src/providers/lancerProvider";

interface Props {
  issue: Issue;
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

const Bounty: React.FC<Props> = ({ issue }) => {
  const { wallet, anchor, program, user } = useLancer();
  const creator = new PublicKey(issue.pubkey);

  const [formData, setFormData] = useState({
    organizationName: "",
    repositoryName: "",
    issueTitle: "",
    issueDescription: "",
    requirements: [],
    estimatedTime: "",
    isPrivate: false,
    paymentType: "spl",
    paymentAmount: 0,
    mintAddress: "",
  });
  const ffa = issue.escrowKey ? new PublicKey(issue.escrowKey) : undefined;

  const descriptionMarkup = () => {
    const markdown = marked.parse(issue.description, { breaks: true });
    return { __html: markdown };
  };

  const fundFeature = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const accounts = await anchor.connection.getParsedProgramAccounts(
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
      }
    );
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const addSubmitterFFAClick = async () => {
    // debugger;
    addSubmitterFFA(creator, creator, ffa, wallet, anchor, program);
    if (issue.state === IssueState.NEW) {
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/state`,
        {
          org: issue.org,
          repo: issue.repo,
          issueNumber: issue,
          state: IssueState.ACCEPTING_APPLICATIONS,
        }
      );
    }
  };

  const removeSubmitterFFAClick = async () => {
    await removeSubmitterFFA(creator, creator, ffa, wallet, anchor, program);

    const acc = getFeatureFundingAccount(ffa, program);
    const submitters = (await acc).approvedSubmitters.map((submitter) =>
      submitter.toString()
    );
  };

  const submitFFAClick = async () => {
    submitRequestFFA(creator, user.publicKey, ffa, wallet, anchor, program);
  };

  const denyRequestFFAClick = async () => {
    denyRequestFFA(creator, creator, ffa, wallet, anchor, program);
  };

  const approveRequestFFAClick = async () => {
    approveRequestFFA(creator, creator, ffa, wallet, anchor, program);
  };

  const voteToCancelCreatorFFAClick = async () => {
    voteToCancelFFA(creator, creator, ffa, wallet, anchor, program);
  };

  const voteToCancelSubmitterFFAClick = async () => {
    voteToCancelFFA(creator, user.publicKey, ffa, wallet, anchor, program);
  };

  const cancelSubmitterFFAClick = async () => {
    cancelFFA(creator, ffa, wallet, anchor, program);
  };

  const getFFAClick = async () => {
    console.log("creator", creator.toString());
    const acc = await getFeatureFundingAccount(ffa, program);
    acc.approvedSubmitters.forEach((sub) => console.log(sub.toString()));
    console.log(acc);
  };
  return (
    <div className="bounty-page">
      <h2 className="bounty-title">{issue.title}</h2>
      <div className="bounty-content">
        <div className="bounty-left-side">
          <SideBarSection title="Payout">
            <div>
              ${issue.amount} {getMintName(issue.mint)}
            </div>
          </SideBarSection>

          <SideBarSection title="Estimated Time">
            <div>{issue.estimatedTime} hours</div>
          </SideBarSection>
          <SideBarSection title="Escrow Account">
            <a
              className="issue-creator"
              href={getSolscanAddress(issue.escrowKey)}
              target="_blank"
              rel="noreferrer"
            >
              Escrow Account
            </a>
          </SideBarSection>

          <SideBarSection title="State">
            <div className={`issue-state ${issue.state} text-start`}>
              {issue.state}
            </div>
          </SideBarSection>
        </div>
        <div>
          <div
            className="bounty-description-markup"
            dangerouslySetInnerHTML={descriptionMarkup()}
          />
          <form
            className="form"
            style={{ width: "1000px" }}
            onSubmit={fundFeature}
          >
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
          {false && (
            <div>
              <button onClick={() => getFFAClick()}>Get FFA</button>

              <button onClick={() => addSubmitterFFAClick()}>
                Add Submitter FFA
              </button>
              <button onClick={() => removeSubmitterFFAClick()}>
                Remove Submitter FFA
              </button>
              <button onClick={() => submitFFAClick()}>
                Submit Request FFA
              </button>
              <button onClick={() => denyRequestFFAClick()}>
                Deny Request FFA
              </button>
              <button onClick={() => approveRequestFFAClick()}>
                Approve Request FFA
              </button>
              <button onClick={() => voteToCancelCreatorFFAClick()}>
                Cancel Creator FFA
              </button>

              <button onClick={() => voteToCancelSubmitterFFAClick()}>
                Cancel Submitter FFA
              </button>
              <button onClick={() => cancelSubmitterFFAClick()}>
                Cancel FFA
              </button>
            </div>
          )}
        </div>
        <div className="bounty-right-side">
          <SideBarSection title="Creator">
            <a
              className="issue-creator"
              href={`https://github.com/${issue.org}/${issue.repo}`}
              target="_blank"
              rel="noreferrer"
            >
              {issue.org}/{issue.repo}
            </a>
          </SideBarSection>
          <SideBarSection title="Author">
            <div>{issue.author}</div>
          </SideBarSection>
          <SideBarSection title="GitHub Links">
            <div className="bounty-github-links">
              <a
                className="issue-creator"
                href={`https://github.com/${issue.org}/${issue.repo}/issue/${issue.issueNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                Issue
              </a>
              <a
                className="issue-creator"
                href={`https://github.com/${issue.org}/${issue.repo}/pull/${issue.pullNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                Pull Request
              </a>
            </div>
          </SideBarSection>

          {issue.tags && (
            <SideBarSection title="Tags">
              <div className="bounty-tags">
                {issue.tags.map((tag, index) => (
                  <div className="tag" key={index}>
                    {capitalize(tag)}
                  </div>
                ))}
              </div>
            </SideBarSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bounty;

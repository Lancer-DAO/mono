import { useEffect, useState } from "react";
import { marked } from "marked";
import RadioWithCustomInput from "./RadioWithCustomInput";
import { useLocation } from "react-router-dom";
import { WALLET_ADAPTERS } from "@web3auth/base";
import {
  BONK_MINT,
  DEVNET_USDC_MINT,
  IS_MAINNET,
  MAINNET_USDC_MINT,
  REACT_APP_AUTH0_DOMAIN,
  REACT_APP_CLIENTID,
} from "@/src/constants";
import { convertToQueryParams, getApiEndpoint, getEndpoint } from "@/src/utils";
import axios from "axios";
import {
  ACCOUNT_API_ROUTE,
  DATA_API_ROUTE,
  GITHUB_ISSUE_API_ROUTE,
  ISSUE_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "@/server/src/constants";
import {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import keypair from "../../../test-keypair.json";
import fromKeypair from "../../../second_wallet.json";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { userInfo } from "os";
import { createFFA, fundFFA } from "@/src/onChain";
import { WEB3_INIT_STATE } from "@/src/types";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import Base58 from "base-58";
import { useLancer } from "@/src/providers/lancerProvider";

const secretKey = Uint8Array.from(keypair);
const keyPair = Keypair.fromSecretKey(secretKey);
const fromSecretKey = Uint8Array.from(fromKeypair);
const fromKeyPair = Keypair.fromSecretKey(fromSecretKey);
export const DEFAULT_MINTS = [
  {
    name: "SOL",
    mint: undefined,
  },
  {
    name: "USDC",
    mint: DEVNET_USDC_MINT,
  },
  {
    name: "BONK",
    mint: BONK_MINT,
  },
];
export const DEFAULT_MINT_NAMES = DEFAULT_MINTS.map((mint) => mint.name);

const Form = () => {
  const { user, program, anchor, wallet } = useLancer();

  const [repositories, setRepositories] = useState<any[]>();
  const [repo, setRepo] = useState<any>();
  const [formData, setFormData] = useState({
    organizationName: "",
    repositoryName: "",
    issueTitle: "",
    issueDescription: "",
    requirements: [],
    estimatedTime: "",
    isPrivate: false,
  });

  useEffect(() => {
    if (user?.githubId) {
      axios
        .get(
          `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_API_ROUTE}/organizations?${convertToQueryParams(
            { githubId: user.githubId }
          )}`
        )
        .then((resp) => {
          console.log(resp);
          setRepositories(resp.data.data);
        });
    }
  }, [user]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeRepo = (event) => {
    const repoFullName = event.target.value;
    const repo = repositories.find((_repo) => _repo.full_name === repoFullName);
    setRepo(repo);
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.checked,
    });
  };

  const handleRequirementsChange = (event) => {
    const requirements = event.target.value.split(",");
    setFormData({
      ...formData,
      requirements,
    });
  };

  const handleDescriptionChange = (event) => {
    setFormData({
      ...formData,
      issueDescription: event.target.value,
    });
  };

  const previewMarkup = () => {
    const markdown = marked.parse(formData.issueDescription, { breaks: true });
    return { __html: markdown };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const createIssue = async () => {
      return axios.post(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${GITHUB_ISSUE_API_ROUTE}`,
        {
          githubId: user.githubId,
          githubLogin: user.githubLogin,
          solanaKey: user.publicKey.toString(),
          org: repo ? repo.full_name.split("/")[0] : "Lancer-DAO",
          repo: repo ? repo.full_name.split("/")[1] : "github-app",
          title: formData.issueTitle,
          description: formData.issueDescription,
          tags: formData.requirements,
          private: formData.isPrivate || repo ? repo.private : false,
          estimatedTime: formData.estimatedTime,
        }
      );
    };

    const createAndFundEscrow = async (issue: {
      number: number;
      uuid: string;
    }) => {
      console.log("submit");
      const creator = user.publicKey;
      const timestamp = await createFFA(creator, wallet, anchor, program);
      // const timestamp = "1678054848253";
      await axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/timestamp`,
        {
          org: repo ? repo.full_name.split("/")[0] : "Lancer-DAO",
          repo: repo ? repo.full_name.split("/")[1] : "github-app",
          issueNumber: issue.number,
          timestamp: timestamp,
        }
      );
      window.location.replace(`/bounty?id=${issue.uuid}`);
    };

    const issueResponse = await createIssue();
    console.log("issueres", issueResponse);
    await createAndFundEscrow(issueResponse.data.issue);

    console.log(formData); // do something with form data
  };

  return (
    <div className="form-container">
      <div className="form-title">Create New Lancer Issue</div>
      <form
        className="form"
        style={{ width: "1000px" }}
        onSubmit={handleSubmit}
      >
        <div className="form-subtitle">GitHub Issue Information</div>
        <div className="form-row-grid">
          <div className="form-cell">
            <label className="form-label">Project</label>

            {repositories ? (
              <select
                name="project"
                value={repo ? repo.full_name : ""}
                onChange={handleChangeRepo}
                className="form-select"
              >
                <option value="Lancer-DAO/github-app">Demo Repo</option>
                {repositories.map((project) => (
                  <option value={project.full_name} key={project.full_name}>
                    {project.full_name}
                  </option>
                ))}
              </select>
            ) : (
              <div>Loading Your Projects</div>
            )}
          </div>
        </div>
        <div className="form-cell">
          <label className="form-label">Issue Title</label>
          <input
            type="text"
            name="issueTitle"
            value={formData.issueTitle}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-cell">
          <label className="form-label">Issue Description</label>
          <textarea
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleDescriptionChange}
            className="form-textarea"
          />
        </div>
        <div className="form-cell">
          <label className="form-label">Preview</label>
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={previewMarkup()}
          />
        </div>
        <div className="form-subtitle">Additional Lancer Information</div>
        <div className="form-row-grid grid-1-1">
          <div className="form-cell">
            <label className="form-label">Tags (comma-separated list)</label>
            <input
              type="text"
              name="requirements"
              value={formData.requirements}
              onChange={handleRequirementsChange}
              className="form-input"
            />
          </div>
          <div className="form-row-grid grid-1-1">
            <div className="form-cell">
              <label className="form-label">Estimated Time (hours)</label>
              <input
                type="text"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-cell">
              <label className="form-label">Private Issue</label>
              <input
                type="checkbox"
                name="isPrivate"
                disabled={repo ? repo.private : false}
                checked={formData.isPrivate || repo ? repo.private : false}
                onChange={handleCheckboxChange}
                className="form-checkbox"
              />
            </div>
          </div>
        </div>
        <div className="submit-wrapper">
          <button type="submit" className="form-submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;

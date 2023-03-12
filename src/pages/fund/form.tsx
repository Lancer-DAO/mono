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
import classnames from "classnames";

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
  const [isOpen, setIsOpen] = useState(false);

  const [isPreview, setIsPreview] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const togglePreview = () => setIsPreview(!isPreview);

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

  const handleChangeRepo = (repoFullName: string) => {
    const repo = repositories.find((_repo) => _repo.full_name === repoFullName);
    setRepo(repo);
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      isPrivate: !formData.isPrivate,
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
          githubLogin: user.githugLogin,
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
      <form className="form" onSubmit={handleSubmit}>
        <>
          <div id="job-information" className="form-layout-flex">
            <h2
              id="w-node-a3d1ad77-e5aa-114b-bcd7-cde3db1bb746-0ae9cdc2"
              className="form-subtitle"
            >
              New Lancer Bounty
            </h2>
            <div
              id="w-node-_11ff66e2-bb63-3205-39c9-a48a569518d9-0ae9cdc2"
              className="input-container-full-width"
            >
              <div
                data-delay="0"
                data-hover="false"
                id="w-node-b1521c3c-4fa1-4011-ae36-88dcb6e746fb-0ae9cdc2"
                className="w-dropdown"
                onClick={toggleOpen}
              >
                <main className="dropdown-toggle-2 w-dropdown-toggle">
                  <div className="w-icon-dropdown-toggle"></div>
                  <div>
                    {repositories ? (
                      repo ? (
                        repo.full_name
                      ) : (
                        <div>
                          Select Project <span className="color-red">* </span>
                        </div>
                      )
                    ) : (
                      "Loading Repositories"
                    )}
                  </div>
                </main>
                {isOpen && repositories && (
                  <div className="w-dropdown-list">
                    {repositories.map((project) => (
                      <div
                        onClick={() => handleChangeRepo(project.full_name)}
                        key={project.full_name}
                        className="w-dropdown-link"
                      >
                        {project.full_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label>
                Issue Title<span className="color-red">*</span>
              </label>
              <input
                type="text"
                className="input w-input"
                name="issueTitle"
                placeholder="Ex. Add New Feature "
                id="Issue"
                value={formData.issueTitle}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="field-label-2">
                Est. Time to Completion<span className="color-red">*</span>
              </label>
              <input
                type="number"
                className="input w-input"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                placeholder="Ex. 3 (hours)"
                id="Issue-Description"
              />
            </div>
            <div>
              <label className="field-label">
                Coding Languages<span className="color-red">* </span>
              </label>
              <input
                type="text"
                className="input w-input"
                name="requirements"
                value={formData.requirements}
                onChange={handleRequirementsChange}
                placeholder="list seperated by commas"
                id="Job-Location-2"
              />
            </div>
            <div
              id="w-node-_19e3179a-ebf7-e568-5dcf-3c0e607846d8-0ae9cdc2"
              className="input-container-full-width"
            >
              <div className="description-label">
                <label>
                  Description<span className="color-red">*</span>
                </label>
                <button
                  className="button-primary hug no-box-shadow"
                  onClick={(e) => {
                    e.preventDefault();
                    togglePreview();
                  }}
                >
                  {isPreview ? "Edit" : "Preview"}
                </button>
              </div>
              {isPreview ? (
                <div
                  className="markdown-preview"
                  dangerouslySetInnerHTML={previewMarkup()}
                />
              ) : (
                <textarea
                  id="Job-Description"
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Provide a step by step breakdown of what is needed to complete the task. Include criteria that will determine success. **Markdown Supported** "
                  className="textarea w-input"
                />
              )}
            </div>
            <div className="required-helper">
              <span className="color-red">* </span> Required
            </div>
            <label className="w-checkbox checkbox-field-2">
              <div
                className={classnames(
                  "w-checkbox-input w-checkbox-input--inputType-custom checkbox",
                  {
                    checked: formData.isPrivate || repo ? repo.private : false,
                    disabled: repo ? repo.private : false,
                  }
                )}
                onChange={handleCheckboxChange}
              />

              <label className="check-label">Is this a Private Issue?</label>
              <p className="check-paragraph">
                Only GitHub collaborators will have access to see this.
              </p>
            </label>
            <input
              type="submit"
              value="Submit"
              data-wait="Please wait..."
              id="w-node-ab1d78c4-cf4d-d38a-1a64-ef9c503727ac-0ae9cdc2"
              className={classnames("button-primary issue-submit", {
                disabled:
                  !repo ||
                  !formData.issueTitle ||
                  !formData.estimatedTime ||
                  !formData.requirements ||
                  !formData.issueDescription ||
                  formData.requirements?.length === 0,
              })}
            />
          </div>
        </>
      </form>
    </div>
  );
};

export default Form;

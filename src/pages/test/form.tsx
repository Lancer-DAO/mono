import { useEffect, useState } from "react";
import { marked } from "marked";
import RadioWithCustomInput from "./RadioWithCustomInput";
import { useWeb3Auth } from "@/src/providers";
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
import { convertToQueryParams, getApiEndpoint } from "@/src/utils";
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

const secretKey = Uint8Array.from(keypair);
const keyPair = Keypair.fromSecretKey(secretKey);
const fromSecretKey = Uint8Array.from(fromKeypair);
const fromKeyPair = Keypair.fromSecretKey(fromSecretKey);
const DEFAULT_MINTS = [
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
const DEFAULT_MINT_NAMES = DEFAULT_MINTS.map((mint) => mint.name);

const Form = () => {
  //   const {
  //     provider,
  //     loginRWA,
  //     getUserInfo,
  //     signAndSendTransaction,
  //     setIsLoading,
  //     isWeb3AuthInit,
  //     getBalance,
  //     logout,
  //   } = useWeb3Auth();
  const search = useLocation().search;
  const [repositories, setRepositories] = useState<any[]>();
  const [repo, setRepo] = useState<any>();
  const [userId, setUserId] = useState<string>("github|117492794");
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const token = jwt == null ? "" : jwt;
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

  useEffect(() => {
    // handleAuthLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  useEffect(() => {
    // if (isWeb3AuthInit) {
    const getUserOrgs = async () => {
      //   const userInfo = await getUserInfo();
      //   console.log("user", userInfo);
      //   const userId = userInfo.verifierId;
      //   setUserId(userId);

      axios
        .get(
          `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_API_ROUTE}/organizations?${convertToQueryParams(
            { githubId: userId }
          )}`
        )
        .then((resp) => {
          console.log(resp);
          setRepositories(resp.data.data);
        });
    };
    getUserOrgs();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthLogin = async () => {
    try {
      //   debugger;
      //   setIsLoading(true);
      if (token !== "") {
        // await loginRWA(WALLET_ADAPTERS.OPENLOGIN, "jwt", token);
      } else {
        const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback`}&state=STATE`;
        console.log(rwaURL);
        // debugger;
        window.location.href = rwaURL;
      }
    } finally {
      //   setIsLoading(false);
    }
  };

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

    const createIssue = async () =>
      axios.post(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${GITHUB_ISSUE_API_ROUTE}`,
        {
          githubId: userId,
          githubLogin: "jacksturt",
          org: repo.full_name.split("/")[0],
          repo: repo.full_name.split("/")[1],
          title: formData.issueTitle,
          description: formData.issueDescription,
          fundingHash: "",
          fundingAmount: formData.paymentAmount,
          fundingMint: formData.mintAddress ? "" : formData.mintAddress,
          tags: formData.requirements,
          private: formData.isPrivate || repo ? repo.private : false,
          estimatedTime: formData.estimatedTime,
        }
      );
    const sendEscrow = async (issue: number) => {
      const connection = new Connection(clusterApiUrl("devnet"));
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      let TransactionInstruction;
      const mint = formData.mintAddress
        ? new PublicKey(formData.mintAddress)
        : undefined;

      if (!mint) {
        TransactionInstruction = SystemProgram.transfer({
          fromPubkey: fromKeyPair.publicKey,
          toPubkey: keyPair.publicKey,
          lamports: Math.round(formData.paymentAmount * LAMPORTS_PER_SOL),
        });
      } else {
        // debugger;
        const tokenMint = await getMint(connection, mint);
        const actualAmount = BigInt(
          formData.paymentAmount * Math.pow(10, tokenMint.decimals)
        );
        const toTokenAddress = await getAssociatedTokenAddress(
          mint,
          keyPair.publicKey
        );
        const fromTokenAddress = await getAssociatedTokenAddress(
          mint,
          fromKeyPair.publicKey
        );
        // debugger;
        try {
          console.log("try");
          const fromTokenAccount = await getAccount(
            connection,
            fromTokenAddress
          );
          console.log("fromTA", fromTokenAccount.address.toString());
        } catch (e) {
          console.log("catch");
          if (e instanceof TokenAccountNotFoundError) {
            const createToken = await createAssociatedTokenAccountInstruction(
              fromKeyPair.publicKey,
              fromTokenAddress,
              fromKeyPair.publicKey,
              mint
            );
            const txInfo = {
              /** The transaction fee payer */
              feePayer: fromKeyPair.publicKey,
              /** A recent blockhash */
              blockhash: blockhash,
              /** the last block chain can advance to before tx is exportd expired */
              lastValidBlockHeight: lastValidBlockHeight,
            };

            const transaction = new Transaction(txInfo).add(createToken);
            const signature = await sendAndConfirmTransaction(
              connection,
              transaction,
              [fromKeyPair]
            );
            console.log("created token account", signature);
          } else {
            console.error(e);
          }
        }
        // debugger;
        TransactionInstruction = createTransferInstruction(
          fromTokenAddress,
          toTokenAddress,
          fromKeyPair.publicKey,
          actualAmount
        );
      }

      const txInfo = {
        /** The transaction fee payer */
        feePayer: fromKeyPair.publicKey,
        /** A recent blockhash */
        blockhash: blockhash,
        /** the last block chain can advance to before tx is exportd expired */
        lastValidBlockHeight: lastValidBlockHeight,
      };

      const transaction = new Transaction(txInfo).add(TransactionInstruction);
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeyPair]
      );

      console.log("sig", signature);
      axios.put(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/funding_hash`,
        {
          org: repo.full_name.split("/")[0],
          repo: repo.full_name.split("/")[1],
          issueNumber: issue,
          hash: signature,
        }
      );
      // debugger
    };
    // const issueResponse = await createIssue();
    // console.log("issueres", issueResponse);
    // await sendEscrow(issueResponse.data.issue.number);

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
                <option value="">--Select Project--</option>
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
    </div>
  );
};

export default Form;

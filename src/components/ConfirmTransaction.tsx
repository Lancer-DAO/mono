import { useCallback, useEffect, useState } from "react";
import keypair from "../../test-keypair.json";
// import { ReactComponent as ReactLogo } from "../logo.svg";
// import { ReactComponent as SolLogo } from "../../node_modules/cryptocurrency-icons/svg/white/sol.svg";

import { Issue, IssueState } from "@/types";
import { useLocation } from "react-router-dom";
import { useWeb3Auth } from "@/providers";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { Loader, PubKey } from "@/components";
import axios from "axios";
import {
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "@/server/src/constants";
import {
  convertToQueryParams,
  getApiEndpoint,
  getSolscanAddress,
} from "@/utils";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import classNames from "classnames";

const REACT_APP_AUTH0_DOMAIN = "https://dev-kgvm1sxe.us.auth0.com";
const REACT_APP_RWA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
const secretKey = Uint8Array.from(keypair);
const keyPair = Keypair.fromSecretKey(secretKey);
enum ApprovalState {
  APPROVE = "Approve",
  APPROVING = "Approving",
  APPROVED = "Approved",
  ERROR = "Error",
}

export const ConfirmFunding = () => {
  const {
    provider,
    loginRWA,
    getUserInfo,
    signAndSendTransaction,
    setIsLoading,
    isWeb3AuthInit,
    getBalance,
    logout,
  } = useWeb3Auth();
  const [issue, setIssue] = useState<Issue>(undefined);
  const search = useLocation().search;
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const token = jwt == null ? "" : jwt;

  const [buttonText, setButtonText] = useState(ApprovalState.APPROVE);
  const [sendHash, setSendHash] = useState<string>();
  const [balance, setBalance] = useState(0.0);
  const [solanaKey, setSolanaKey] = useState();
  const [errorText, setErrorText] = useState<string>(undefined);

  useEffect(() => {
    let extensionId = window.localStorage.getItem("lancerExtensionId");
    if (!extensionId || extensionId === "null") {
      extensionId = params.get("extension_id");
      window.localStorage.setItem("lancerExtensionId", extensionId);
    }
    console.log("extension_id", extensionId);
    chrome.runtime.sendMessage(
      extensionId,
      { route: "newIssueFundingInfo" },
      (response) => {
        console.log(response);
        setIssue(response.issue);
      }
    );
    // console.log('issueInfo', issueInfo)
  }, []);

  useEffect(() => {
    const getWalletBalance = async () => {
      const walletBalance = await getBalance();
      if (provider) {
        const solanaKey = (await provider.getAccounts())[0];
        setSolanaKey(solanaKey);
      }
      console.log("balacnce", walletBalance);
      setBalance(walletBalance / LAMPORTS_PER_SOL);
    };
    getWalletBalance();
  }, [getBalance, balance, isWeb3AuthInit, provider]);

  useEffect(() => {
    handleAuthLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3AuthInit]);

  const onClick = useCallback(async () => {
    try {
      setButtonText(ApprovalState.APPROVING);
      console.log();

      const signature = await wallet.signAndSendTransaction(
        issue.amount,
        keyPair.publicKey.toString()
      );
      const newIssue = { ...issue, hash: signature };
      console.log("sig", signature);
      setButtonText(ApprovalState.APPROVED);
      setSendHash(signature);
      console.log("msg", {
        request: "confirmed",
        issue: newIssue,
      });
      const accountId = (await getUserInfo()).verifierId;
      const accountLogin = (
        await axios.get(
          `https://api.github.com/user/${accountId.split("|")[1]}`
        )
      ).data.login;
      console.log(newIssue, accountId, solanaKey);
      axios.post(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${NEW_ISSUE_API_ROUTE}?${convertToQueryParams(
          {
            ...newIssue,
            fundingAmount: newIssue.amount,
            fundingHash: newIssue.hash,
            githubId: accountId,
            solanaKey: solanaKey,
            githubLogin: accountLogin,
          }
        )}`
      );
    } catch (e) {
      setButtonText(ApprovalState.ERROR);
      setErrorText(e.toString());
    }
  }, [issue, signAndSendTransaction, isWeb3AuthInit, solanaKey, getUserInfo]);

  const handleAuthLogin = async () => {
    try {
      setIsLoading(true);
      if (token !== "") {
        await loginRWA(WALLET_ADAPTERS.OPENLOGIN, "jwt", token);
      } else {
        const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_RWA_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback`}&state=STATE`;
        console.log(rwaURL);
        // debugger;
        window.location.href = rwaURL;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="confirm-funding-wrapper">
      {issue === undefined ? (
        <div className="loading-text">Loading Issue Info</div>
      ) : (
        <>
          <div className="logo-wrapper">
            {/* <ReactLogo className="logo" /> */}
          </div>
          <div className="confirm-title">
            {`Would you like fund this issue with ${issue.amount.toFixed(
              4
            )} SOL`}
            {/* <SolLogo className="solana-logo" /> */}
          </div>

          {provider ? (
            <div className="confirm-wrapper">
              <div>
                {`Current Wallet: `}
                {solanaKey && <PubKey pubKey={new PublicKey(solanaKey)} />}
              </div>
              <div>{`Balance: ${balance} SOL`}</div>
              {balance < issue.amount && (
                <div className="error-text">
                  Please send more funds to your wallet.
                </div>
              )}
              {errorText && <div className="error-text">{errorText}</div>}
              <button
                disabled={
                  buttonText === ApprovalState.APPROVED ||
                  buttonText === ApprovalState.ERROR ||
                  balance < issue.amount
                }
                className={classNames("confirm-button", {
                  disabled:
                    buttonText === ApprovalState.ERROR ||
                    balance < issue.amount,
                })}
                onClick={(e) => {
                  onClick();
                  e.preventDefault();
                }}
              >
                {buttonText}
              </button>
            </div>
          ) : (
            <div className="loading-wrapper">
              <div className="loading-text"> Connecting to Web3Auth</div>
              <Loader
                height={16}
                width={16}
                strokeWidth={3}
                color={"#14bb88"}
              />
            </div>
          )}

          {sendHash && (
            <button
              className={"confirm-button"}
              onClick={(e) => {
                typeof window &&
                  window.open(getSolscanAddress(sendHash), "_blank");
                e.preventDefault();
              }}
            >
              View Transaction
            </button>
          )}
        </>
      )}
    </div>
  );
};

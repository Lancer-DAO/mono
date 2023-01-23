import { useCallback, useEffect, useState } from "react";
import keypair from "../../test-keypair.json";
// import { ReactComponent as ReactLogo } from "../logo.svg";
// import { ReactComponent as SolLogo } from "../../node_modules/cryptocurrency-icons/svg/white/sol.svg";

import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  Connection,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { Buffer } from "buffer";
import { Issue } from "@/types";
import { useLocation } from "react-router-dom";
import { useWeb3Auth } from "@/providers";
const TO_DEVNET_PUBKEY_SOL = "Ea1ndgjbtivGgGdmVNAe1EqyhhHrSjEv12hPqZ4WXp19";
import { WALLET_ADAPTERS } from "@web3auth/base";
import { Loader } from "@/components";
import axios from "axios";
import { API_ENDPOINT } from "@/constants";
import {
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { convertToQueryParams } from "@/utils";

const REACT_APP_AUTH0_DOMAIN = "https://dev-kgvm1sxe.us.auth0.com";
const REACT_APP_RWA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
const REACT_APP_BACKEND_SERVER_API = "http://localhost:3001/callback";
enum ApprovalState {
  APPROVE = "Approve",
  APPROVING = "Approving",
  APPROVED = "Approved",
  ERROR = "Error",
}

interface ConfirmFundingProps {
  port: chrome.runtime.Port;
  issue: Issue;
}

export const ConfirmFunding = ({ issue, port }: ConfirmFundingProps) => {
  const {
    provider,
    loginRWA,
    getUserInfo,
    signAndSendTransaction,
    setIsLoading,
    isWeb3AuthInit,
  } = useWeb3Auth();
  const search = useLocation().search;
  const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_RWA_CLIENTID}&redirect_uri=${REACT_APP_BACKEND_SERVER_API}&state=STATE`;
  const jwt = new URLSearchParams(search).get("token");
  const token = jwt == null ? "" : jwt;

  const [buttonText, setButtonText] = useState(ApprovalState.APPROVE);
  const [sendHash, setSendHash] = useState<string>();

  useEffect(() => {
    handleAuthLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3AuthInit]);

  const onClick = useCallback(async () => {
    try {
      setButtonText(ApprovalState.APPROVING);

      const signature = await signAndSendTransaction(
        issue.amount,
        TO_DEVNET_PUBKEY_SOL
      );
      const newIssue = { ...issue, hash: signature };
      console.log("sig", signature);
      setButtonText(ApprovalState.APPROVED);
      setSendHash(signature);
      console.log("msg", {
        request: "confirmed",
        issue: newIssue,
      });
      port.postMessage({
        request: "confirmed",
        issue: newIssue,
      });
      const accountId = (await getUserInfo()).verifierId;
      const solanaKey = (await provider.getAccounts())[0];
      const accountLogin = (
        await axios.get(
          `https://api.github.com/user/${accountId.split("|")[1]}`
        )
      ).data.login;
      console.log(newIssue, accountId, solanaKey);
      axios.post(
        `${API_ENDPOINT}${DATA_API_ROUTE}/${NEW_ISSUE_API_ROUTE}?${convertToQueryParams(
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
      console.error(e);
    }
  }, [issue, buttonText, signAndSendTransaction, isWeb3AuthInit]);

  const handleAuthLogin = async () => {
    try {
      setIsLoading(true);
      if (token !== "") {
        await loginRWA(WALLET_ADAPTERS.OPENLOGIN, "jwt", token);
      } else {
        window.location.href = rwaURL;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="confirm-funding-wrapper">
      <div className="logo-wrapper">{/* <ReactLogo className="logo" /> */}</div>
      <div className="confirm-title">
        {`Would you like fund this issue with ${issue.amount.toFixed(4)} SOL`}
        {/* <SolLogo className="solana-logo" /> */}
      </div>

      {provider ? (
        <button
          disabled={
            buttonText === ApprovalState.APPROVED ||
            buttonText === ApprovalState.ERROR
          }
          className={"confirm-button"}
          onClick={(e) => {
            onClick();
            e.preventDefault();
          }}
        >
          {buttonText}
        </button>
      ) : (
        <div className="loading-wrapper">
          <div className="loading-text"> Connecting to Web3Auth</div>
          <Loader height={16} width={16} strokeWidth={3} color={"#14bb88"} />
        </div>
      )}

      {sendHash && (
        <button
          className={"confirm-button"}
          onClick={(e) => {
            typeof window &&
              window.open(
                `https://solscan.io/tx/${sendHash}?cluster=devnet`,
                "_blank"
              );
            e.preventDefault();
          }}
        >
          View Transaction
        </button>
      )}
    </div>
  );
};

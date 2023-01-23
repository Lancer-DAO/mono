import { useCallback, useState } from "react";
import keypair from "../../second_wallet.json";

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
import { Issue, ContributorCompensationInfo, IssueState } from "@/types";
import { PubKey } from "../../src/components/PublicKey";
import classNames from "classnames";
import axios from "axios";
import { API_ENDPOINT } from "@/constants";
import {
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
  MERGE_PULL_REQUEST_API_ROUTE,
  NEW_ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { convertToQueryParams, deepCopy } from "@/utils";
// import { ReactComponent as ReactLogo } from "../logo.svg";
// import { ReactComponent as SolLogo } from "../../node_modules/cryptocurrency-icons/svg/white/sol.svg";

const secretKey = Uint8Array.from(keypair);

enum ApprovalState {
  APPROVE = "Approve",
  APPROVING = "Approving",
  APPROVED = "Approved",
  ERROR = "Error",
}

interface DistributeFundingProps {
  port: chrome.runtime.Port;
  issue: Issue;
}

export const DistributeFunding = ({ issue, port }: DistributeFundingProps) => {
  const [buttonText, setButtonText] = useState(ApprovalState.APPROVE);
  const keyPair = Keypair.fromSecretKey(secretKey);

  const { connection } = useConnection();

  const onClick = useCallback(async () => {
    try {
      setButtonText(ApprovalState.APPROVING);
      const lamports = Math.trunc(LAMPORTS_PER_SOL * issue.amount);
      const toPubKey = new PublicKey(issue.pubkey);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keyPair.publicKey,
          toPubkey: toPubKey,
          lamports,
        })
      );

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keyPair]
      );
      // const resp = await fetch(
      //   "http://localhost:3001/ghToken?user_id=github|117492794&repo=github-app&org=Lancer-DAO&pull_number=23"
      // );

      // const data = await resp.json();
      setButtonText(ApprovalState.APPROVED);
      axios.post(
        `${API_ENDPOINT}${DATA_API_ROUTE}/${MERGE_PULL_REQUEST_API_ROUTE}?${convertToQueryParams(
          {
            ...issue,
            payoutHash: signature,
          }
        )}`
      );
    } catch (e) {
      setButtonText(ApprovalState.ERROR);
      console.error(e);
    }
  }, [issue, buttonText]);

  return (
    <div className="confirm-funding-wrapper">
      <div className="logo-wrapper">{/* <ReactLogo className="logo" /> */}</div>
      <div className="confirm-title">{`Would you like to approve the closing pull request? Doing so will compensate the contributors as shown.`}</div>
      {issue.pullNumber && (
        <div className="fund-split-outer">
          <div className="fund-split-wrapper" key={issue.pubkey}>
            <img
              className="contributor-picture"
              src={`https://avatars.githubusercontent.com/u/${
                issue.githubId.split("|")[1]
              }?s=60&v=4`}
            />
            <div className="contributor-name">{issue.author}</div>

            <div className="contributor-amount">
              {`${issue.amount.toFixed(4)} `}
              {/* <SolLogo className="solana-logo" /> */}
            </div>
            {issue.payoutHash && (
              <button
                className={classNames(
                  "confirm-button",
                  "hug",
                  "left-margin",
                  "y-padded"
                )}
                onClick={(e) => {
                  typeof window &&
                    window.open(
                      `https://solscan.io/tx/${issue.payoutHash}?cluster=devnet`,
                      "_blank"
                    );
                  e.preventDefault();
                }}
              >
                View
              </button>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
};

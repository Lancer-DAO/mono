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
  const [issueFunding, setIssueFunding] = useState(issue.fundingSplit);
  const keyPair = Keypair.fromSecretKey(secretKey);

  const { connection } = useConnection();

  const onClick = useCallback(async () => {
    try {
      setButtonText(ApprovalState.APPROVING);
      const signatures: ContributorCompensationInfo[] = [];
      const sendAllTx = issue.fundingSplit?.map(async (split) => {
        const lamports = Math.trunc(LAMPORTS_PER_SOL * split.amount);
        const toPubKey = new PublicKey(split.pubkey);

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
        signatures.push({ ...split, signature: signature });
      });
      if (sendAllTx) {
        await Promise.all(sendAllTx);
        // const resp = await fetch(
        //   "http://localhost:3001/ghToken?user_id=github|117492794&repo=github-app&org=Lancer-DAO&pull_number=23"
        // );

        // const data = await resp.json();
        setButtonText(ApprovalState.APPROVED);
        port.postMessage({
          request: "funds_distributed",
          issue: {
            ...issue,
            paid: true,
            fundingSplit: signatures,
            state: IssueState.APPROVED,
          },
        });
        setIssueFunding(signatures);
      }
    } catch (e) {
      setButtonText(ApprovalState.ERROR);
      console.error(e);
    }
  }, [issue, buttonText]);

  return (
    <div className="confirm-funding-wrapper">
      <div className="logo-wrapper">{/* <ReactLogo className="logo" /> */}</div>
      <div className="confirm-title">{`Would you like to approve the closing pull request? Doing so will compensate the contributors as shown.`}</div>
      {issueFunding && (
        <div className="fund-split-outer">
          {issueFunding.map((split) => (
            <div className="fund-split-wrapper" key={split.pubkey}>
              <img className="contributor-picture" src={split.picture} />
              <div className="contributor-name">{split.name}</div>

              <div className="contributor-amount">
                {`${split.amount.toFixed(4)} `}
                {/* <SolLogo className="solana-logo" /> */}
              </div>
              {split.signature && (
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
                        `https://solscan.io/tx/${split.signature}?cluster=devnet`,
                        "_blank"
                      );
                    e.preventDefault();
                  }}
                >
                  View
                </button>
              )}
            </div>
          ))}
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

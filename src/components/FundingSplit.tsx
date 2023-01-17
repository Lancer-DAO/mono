import { useCallback, useState } from "react";
import keypair from "../../test-keypair.json";
import { Buffer } from "buffer";
import { Issue, ContributorCompensationInfo, IssueState } from "@/types";
import classnames from "classnames";
import { PubKey } from "./PublicKey";
import { PublicKey } from "@solana/web3.js";
import { Save, Edit } from "react-feather";
// import { ReactComponent as ReactLogo } from "../logo.svg";
// import { ReactComponent as SolLogo } from "../../node_modules/cryptocurrency-icons/svg/white/sol.svg";

const secretKey = Uint8Array.from(keypair);

interface FundingSplitProps {
  port: chrome.runtime.Port;
  issue: Issue;
}

const currentContributors: ContributorCompensationInfo[] = [
  {
    pubkey: "BuxU7uwwkoobF8p4Py7nRoTgxWRJfni8fc4U3YKGEXKs",
    name: "jacksturt",
    picture: "https://avatars.githubusercontent.com/u/117492794?s=60&v=4",
    amount: 1,
  },
];

const getRemainingText = (remaining: number): string => {
  if (remaining === 0.0) {
    return 'All fund distributed. Click "Save Changes" to save.';
  } else if (remaining > 0.0) {
    return `Please assign the remaining ${remaining.toFixed(4)}`;
  } else {
    return `Please reduce the total funds by ${(-1 * remaining).toFixed(4)}.`;
  }
};

export const FundingSplit = ({ port, issue }: FundingSplitProps) => {
  const [fundingSplit, setFundingSplit] = useState<
    ContributorCompensationInfo[]
  >(
    issue.fundingSplit
      ? issue.fundingSplit
      : currentContributors.map((contributor) => {
          return { ...contributor, amount: issue.amount };
        })
  );
  const [editing, setEditing] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(0.0);
  const [submitText, setSubmitText] = useState("Submit Split");

  return (
    <div className="confirm-funding-wrapper">
      {issue && (
        <>
          <div className="logo-wrapper">
            {/* <ReactLogo className="logo" /> */}
          </div>
          <div className="confirm-title">
            {`Distribute the ${issue.amount}`}
            {/* <SolLogo className="solana-logo" /> */}
          </div>
          {fundingSplit.length > 0 && (
            <div className="split-info">
              <div className="fund-split-outer">
                {fundingSplit.map((split) => (
                  <div className="fund-split-wrapper" key={split.pubkey}>
                    <img className="contributor-picture" src={split.picture} />
                    <div className="contributor-name">{split.name}</div>
                    {!editing ? (
                      <div className="contributor-amount">
                        {`${split.amount.toFixed(4)}`}
                        {/* <SolLogo className="solana-logo" /> */}
                      </div>
                    ) : (
                      <input
                        className={classnames("add-input", "percent-input")}
                        placeholder="Payout"
                        value={split.amount}
                        type="number"
                        onChange={(e) => {
                          const newSplit: ContributorCompensationInfo = {
                            ...split,
                            amount: parseFloat(e.target.value),
                          };
                          Object.assign(
                            fundingSplit.find(
                              (info) =>
                                info.pubkey.toString() ===
                                split.pubkey.toString()
                            )!,
                            newSplit
                          );
                          setFundingSplit(fundingSplit);
                          setRemainingAmount(
                            issue.amount -
                              fundingSplit.reduce(
                                (prev, curr) => prev + curr.amount,
                                0.0
                              )
                          );
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {editing && (
            <div
              className={classnames("remaining-amount", {
                validText: remainingAmount === 0.0,
                invalidText: remainingAmount !== 0.0,
              })}
            >
              {getRemainingText(remainingAmount)}
              {/* {remainingAmount !== 0.0 && <SolLogo className="solana-logo" />} */}
            </div>
          )}
          <div className="button-wrapper">
            <button
              className={classnames("confirm-button", {
                disabled: remainingAmount !== 0.0 || submitText === "Submitted",
              })}
              disabled={submitText === "Submitted"}
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Save Changes" : "Edit Distribution"}
            </button>
            <button
              className={classnames("confirm-button", {
                disabled:
                  editing ||
                  remainingAmount !== 0.0 ||
                  submitText === "Submitted",
              })}
              disabled={
                submitText === "Submitted" || editing || remainingAmount !== 0.0
              }
              onClick={(e) => {
                port.postMessage({
                  request: "funding_split",
                  issue: {
                    ...issue,
                    state: IssueState.AWAITING_REVIEW,
                    fundingSplit: fundingSplit,
                  },
                });
                setSubmitText("Submitted");
                e.preventDefault();
              }}
            >
              {submitText}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

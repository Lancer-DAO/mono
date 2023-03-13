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
import { IssueState, WEB3_INIT_STATE } from "@/src/types";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import Base58 from "base-58";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import FundBounty from "./fundBounty";

const Form = () => {
  const { user, program, anchor, wallet, issue } = useLancer();
  const [formData, setFormData] = useState({
    fundingAmount: null,
  });
  const [fundingType, setFundingType] = useState<"card" | "wallet">("card");
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    issue && (
      <div className="form-container">
        <div className="form">
          <>
            <div id="job-information" className="form-layout-flex">
              <h2
                id="w-node-a3d1ad77-e5aa-114b-bcd7-cde3db1bb746-0ae9cdc2"
                className="form-subtitle"
              >
                Fund Lancer Bounty
              </h2>
              {issue.state === IssueState.NEW &&
              (!issue.escrowKey || !issue.escrowContract) ? (
                <div key="creating-escrow">Creating Escrow Contract</div>
              ) : (
                <>
                  <div className="issue-creation-type">
                    <div
                      className={classnames("form-subtitle hover-effect", {
                        unselected: fundingType !== "card",
                      })}
                      onClick={() => setFundingType("card")}
                    >
                      Pay With Card
                    </div>
                    <div>OR</div>
                    <div
                      className={classnames("form-subtitle hover-effect", {
                        unselected: fundingType !== "wallet",
                      })}
                      onClick={() => setFundingType("wallet")}
                    >
                      Pay With Phantom Wallet
                    </div>
                  </div>

                  {fundingType === "card" && (
                    <>
                      <div>
                        <label>
                          Funding Amount<span className="color-red">*</span>
                        </label>
                        <div>
                          <input
                            type="number"
                            className="input w-input"
                            name="fundingAmount"
                            placeholder="1000 (USD)"
                            id="Issue"
                            value={formData.fundingAmount}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      {formData.fundingAmount && (
                        <FundBounty amount={formData.fundingAmount} />
                      )}
                    </>
                  )}
                  {fundingType === "wallet" && <></>}
                </>
              )}
            </div>
          </>
        </div>
      </div>
    )
  );
};

export default Form;

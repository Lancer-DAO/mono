import {
  ACCOUNT_API_ROUTE,
  ACCOUNT_ISSUE_API_ROUTE,
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { DEVNET_USDC_MINT, REACT_APP_CLIENTID } from "@/src/constants";
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
import {
  convertToQueryParams,
  getApiEndpoint,
  getEndpoint,
  getMintName,
  getSolscanAddress,
} from "@/src/utils";
import { EscrowContract, Issue, IssueState, WEB3_INIT_STATE } from "@/types";
import { Connection, PublicKey } from "@solana/web3.js";
import { WALLET_ADAPTERS } from "@web3auth/base";
import axios from "axios";
import { capitalize } from "lodash";
import { marked } from "marked";
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import Base58 from "base-58";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
import { DEFAULT_MINTS, DEFAULT_MINT_NAMES } from "@/src/pages/fund/form";
import { useLancer, User } from "@/src/providers/lancerProvider";
import FundBounty from "@/src/pages/bounty/components/fundBounty";
import RequestToSubmit from "@/src/pages/bounty/components/requestToSubmit";
import SubmitterSection from "@/src/pages/bounty/components/submitterSection";
import SubmitRequest from "@/src/pages/bounty/components/submitRequest";
import ReviewRequest from "@/src/pages/bounty/components/reviewRequest";
import VoterSection from "@/src/pages/bounty/components/voteToCancel";
import { Clock } from "react-feather";
import USDC from "@/src/assets/USDC";

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

const Bounty: React.FC = () => {
  const { user, issue, issueLoadingState } = useLancer();
  if (!user || !issue) {
    return <></>;
  }
  const isSubmitter = issue.submitter && issue.submitter.uuid === user.uuid;
  const isCreator = issue.creator.uuid === user.uuid;
  const isApprovedSubmitter =
    issue.approvedSubmitters.findIndex(
      (submitter) => submitter.uuid === user.uuid
    ) > -1;
  const isRequestedSubmitter =
    issue.requestedSubmitters.findIndex(
      (submitter) => submitter.uuid === user.uuid
    ) > -1;
  const previewMarkup = () => {
    const markdown = marked.parse(issue.description, { breaks: true });
    return { __html: markdown };
  };

  return (
    <section className="section-job-post wf-section">
      <div className="container-default">
        <div className="w-layout-grid grid-job-post">
          <div
            id="w-node-_9d97a6aa-31d5-1276-53c2-e76c8908f874-fde9cdb1"
            data-w-id="9d97a6aa-31d5-1276-53c2-e76c8908f874"
            className="job-post-container"
          >
            <div className="w-layout-grid grid-job-post-top">
              <div
                id="w-node-_9d97a6aa-31d5-1276-53c2-e76c8908f876-fde9cdb1"
                className="job-post-primary-info"
              >
                <img
                  className="contributor-picture-large"
                  src={`https://avatars.githubusercontent.com/u/${117492794}?s=60&v=4`}
                />
                <div className="bounty-page-title-section">
                  <a
                    href={`https://github.com/${issue.org}`}
                    className="job-post-company-name"
                  >
                    {issue.org}
                  </a>
                  <h1 className="job-post-title">{issue.title}</h1>
                  <div className="job-post-date">Posted: March 12, 2023</div>
                </div>
              </div>
              <div
                id="w-node-c85b3c49-0913-efda-9e04-0bef2535e1fa-fde9cdb1"
                className="job-post-date-container"
              >
                <button className="button-primary">Apply</button>
              </div>
            </div>
            <div className="job-post-middle">
              <div className="job-post-info-container">
                <Clock />
                <div className="job-post-info-text icon-left">24 Hrs</div>
              </div>
              <div className="job-post-info-divider"></div>
              <div className="job-post-info-container">
                <div className="tag-list">
                  {issue.tags.map((tag) => (
                    <div className="tag-item" key={tag}>
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              <div className="job-post-info-divider"></div>
              <div className="job-post-info-container">
                <div className="job-post-info-text icon-right">
                  {issue.amount.toFixed(2)}
                </div>
                <USDC height="24px" width="24px" />
              </div>
            </div>
            <div className="job-post-bottom">
              <h2 className="job-post-subtitle">Job description</h2>
              <div
                className="bounty-markdown-preview"
                dangerouslySetInnerHTML={previewMarkup()}
              />
              <div>
                <button className="button-primary">SAve to My Bounties</button>
              </div>
            </div>
          </div>
          <div
            id="w-node-_272b1d4e-bae1-2928-a444-208d5db4485b-fde9cdb1"
            className="w-form"
          >
            <form
              id="email-form-2"
              name="email-form-2"
              data-name="Email Form 2"
              method="get"
            >
              <h2>Settings</h2>
              {issue.state === IssueState.ACCEPTING_APPLICATIONS ||
                (issue.state === IssueState.IN_PROGRESS &&
                  !isApprovedSubmitter &&
                  issue.approvedSubmitters.length < 3 &&
                  !isRequestedSubmitter && (
                    <RequestToSubmit key={`request-submit`} />
                  ))}
              {isCreator &&
                (issue.requestedSubmitters.length > 0 ? (
                  <>
                    <label className="field-label-5">
                      Requested Applicants
                    </label>

                    {issue.requestedSubmitters.map((submitter) => (
                      <SubmitterSection
                        submitter={submitter}
                        type="requested"
                        key={`requested-submitters-${submitter.uuid}`}
                      />
                    ))}
                  </>
                ) : (
                  <div>No Requested Applicants</div>
                ))}
              {isCreator &&
                (issue.approvedSubmitters.length > 0 ? (
                  <>
                    <label className="field-label-5">Approved Applicants</label>

                    {issue.requestedSubmitters.map((submitter) => (
                      <SubmitterSection
                        submitter={submitter}
                        type="approved"
                        key={`approved-submitters-${submitter.uuid}`}
                      />
                    ))}
                  </>
                ) : (
                  <div>No Approved Applicants</div>
                ))}
              {isCreator &&
                (issue.state === IssueState.AWAITING_REVIEW ? (
                  <>
                    <label className="field-label-10">Submissions</label>
                    <ReviewRequest key={`review-request`} />
                    <input
                      type="submit"
                      value="Merge"
                      data-wait="Please wait..."
                      className="submit-button w-button"
                    />
                    <input
                      type="submit"
                      value="Deny"
                      data-wait="Please wait..."
                      className="submit-button w-button"
                    />
                  </>
                ) : (
                  <div>No Pending Submissions</div>
                ))}

              {isCreator ||
                (isSubmitter && (
                  <input
                    type="submit"
                    value="Cancel"
                    data-wait="Please wait..."
                    className="submit-button w-button"
                  />
                ))}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bounty;

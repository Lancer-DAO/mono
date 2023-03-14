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
import {
  EscrowContract,
  Issue,
  IssueState,
  ISSUE_ACCOUNT_RELATIONSHIP,
  Contributor,
  WEB3_INIT_STATE,
} from "@/types";
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
import { useLancer } from "@/src/providers/lancerProvider";
import RequestToSubmit from "@/src/pages/bounty/components/requestToSubmit";
import SubmitterSection from "@/src/pages/bounty/components/submitterSection";
import SubmitRequest from "@/src/pages/bounty/components/submitRequest";
import ReviewRequest from "@/src/pages/bounty/components/reviewRequest";
import VoterSection from "@/src/pages/bounty/components/voteToCancel";
import { Clock } from "react-feather";
import USDC from "@/src/assets/USDC";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import classNames from "classnames";
import { ContributorInfo } from "@/src/components/ContributorInfo";
import { BountyActions } from "@/src/pages/bounty/components/bountyActions";
dayjs.extend(localizedFormat);

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
  const { user, issue, setIssueLoadingState } = useLancer();
  // const [pollIssue, setPollIssue] = useState(false);
  // useEffect(() => {
  //   const setFuturePoll = () => {
  //     setIssueLoadingState("getting_issue");
  //     console.log("polling issue");
  //     setTimeout(() => setFuturePoll(), 5000);
  //   };
  //   setFuturePoll();
  // }, [setIssueLoadingState]);
  if (!user || !issue) {
    return <></>;
  }
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
            <div
              id="w-node-_9d97a6aa-31d5-1276-53c2-e76c8908f876-fde9cdb1"
              className="job-post-primary-info"
            >
              <img
                className="contributor-picture-large"
                src={`https://avatars.githubusercontent.com/u/${117492794}?s=60&v=4`}
              />
              <div className="bounty-page-title-section">
                <div className="bounty-title-row-1">
                  <a
                    href={`https://github.com/${issue.org}`}
                    className="job-post-company-name"
                  >
                    {issue.org}
                  </a>
                  <div className={`issue-state ${issue.state} text-start`}>
                    {issue.state.split("_").join(" ")}
                  </div>
                </div>
                <h1 className="job-post-title">{issue.title}</h1>
                <div className="bounty-title-row-1">
                  <div className="job-post-date">
                    {`${dayjs
                      .unix(parseInt(issue.timestamp) / 1000)
                      .format("MMMM D, YYYY h:mm A")}`}
                  </div>
                  {issue.escrowKey && (
                    <a
                      href={getSolscanAddress(issue.escrowKey)}
                      className="job-post-company-name"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Escrow Contract
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div></div>
            <div className="job-post-middle">
              <div className="job-post-info-container">
                <Clock />
                <div className="job-post-info-text icon-left">
                  {`${issue.estimatedTime}`} HOURS
                </div>
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
              {<BountyActions />}
            </div>
          </div>
          <div
            id="w-node-_272b1d4e-bae1-2928-a444-208d5db4485b-fde9cdb1"
            className="w-form"
          >
            <div className="contributors-section">
              <h2>Contributors</h2>
              {issue && (
                <div>
                  <label className="field-label-10">Creator</label>
                  <ContributorInfo user={issue.creator} />
                </div>
              )}
              {user.isCreator && issue.deniedRequesters.length > 0 && (
                <div>
                  <label className="field-label-5">Denied Requesters</label>
                  {issue.deniedRequesters.map((submitter) => (
                    <ContributorInfo user={submitter} />
                  ))}
                </div>
              )}
              {user.isCreator && issue.requestedSubmitters.length > 0 && (
                <div>
                  <label className="field-label-5">Requested Applicants</label>
                  {issue.requestedSubmitters.map((submitter) => (
                    <SubmitterSection
                      submitter={submitter}
                      type="requested"
                      key={`requested-submitters-${submitter.uuid}`}
                    />
                  ))}
                </div>
              )}

              {user.isCreator && issue.approvedSubmitters.length > 0 && (
                <div>
                  <label className="field-label-5">Approved Applicants</label>
                  {issue.approvedSubmitters.map((submitter) => (
                    <SubmitterSection
                      submitter={submitter}
                      type="approved"
                      key={`approved-submitters-${submitter.uuid}`}
                    />
                  ))}
                </div>
              )}
              {issue.state === IssueState.AWAITING_REVIEW && (
                <div>
                  <label className="field-label-10">Submissions</label>
                  <ContributorInfo user={issue.currentSubmitter} />
                </div>
              )}
              {user.isCreator &&
                issue.changesRequestedSubmitters.length > 0 && (
                  <div>
                    <label className="field-label-5">Changes Requested</label>
                    {issue.changesRequestedSubmitters.map((submitter) => (
                      <ContributorInfo user={submitter} />
                    ))}
                  </div>
                )}
              {user.isCreator && issue.deniedSubmitters.length > 0 && (
                <div>
                  <label className="field-label-5">Denied Submitters</label>
                  {issue.deniedSubmitters.map((submitter) => (
                    <ContributorInfo user={submitter} />
                  ))}
                </div>
              )}
              {issue.completer && (
                <div>
                  <label className="field-label-10">Bounty Completer</label>
                  <ContributorInfo user={issue.completer} />
                </div>
              )}
              {user.isCreator && issue.cancelVoters.length > 0 && (
                <div>
                  <label className="field-label-5">Voting To Cancel</label>
                  {issue.cancelVoters.map((submitter) => (
                    <ContributorInfo user={submitter} />
                  ))}
                </div>
              )}
              {user.isCreator && issue.needsToVote.length > 0 && (
                <div>
                  <label className="field-label-5">
                    Votes Needed to Cancel
                  </label>
                  {issue.needsToVote.map((submitter) => (
                    <ContributorInfo user={submitter} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bounty;

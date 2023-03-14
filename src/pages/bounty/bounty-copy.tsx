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
  User,
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
import FundBounty from "@/src/pages/bounty/components/fundBounty";
import RequestToSubmit from "@/src/pages/bounty/components/requestToSubmit";
import SubmitterSection from "@/src/pages/bounty/components/submitterSection";
import SubmitRequest from "@/src/pages/bounty/components/submitRequest";
import ReviewRequest from "@/src/pages/bounty/components/reviewRequest";
import VoterSection from "@/src/pages/bounty/components/voteToCancel";

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

const getAvailableCommands = (issue: Issue, user: User) => {
  const availableCommands = [];
  console.log(user, issue);
  if (!issue) {
    return null;
  }

  if (!user) {
    return [<div key="loading-user">Loading User Info</div>];
  }
  if (
    issue.state === IssueState.NEW &&
    (!issue.escrowKey || !issue.escrowContract)
  ) {
    return [<div key="creating-escrow">Creating Escrow Contract</div>];
  }
  const isSubmitter =
    issue.currentSubmitter && issue.currentSubmitter.uuid === user.uuid;
  const isCreator = issue.creator.uuid === user.uuid;
  const isApprovedSubmitter =
    issue.approvedSubmitters.findIndex(
      (submitter) => submitter.uuid === user.uuid
    ) > -1;
  const isRequestedSubmitter =
    issue.requestedSubmitters.findIndex(
      (submitter) => submitter.uuid === user.uuid
    ) > -1;
  if (issue.state === IssueState.NEW && issue.creator.uuid === user.uuid) {
    availableCommands.push(<FundBounty key="fund-bounty" />);
  }
  console.log(isSubmitter, isCreator, isApprovedSubmitter);
  if (
    issue.state === IssueState.ACCEPTING_APPLICATIONS ||
    (issue.state === IssueState.IN_PROGRESS &&
      !isApprovedSubmitter &&
      issue.approvedSubmitters.length < 3 &&
      !isRequestedSubmitter)
  ) {
    availableCommands.push(<RequestToSubmit key={`request-submit`} />);
  }

  // if (issue.approvedSubmitters.length > 0 && isCreator) {
  //   issue.approvedSubmitters.forEach((submitter) => {
  //     if (!submitter.isSubmitter) {
  //       availableCommands.push(
  //         <SubmitterSection
  //           submitter={submitter}
  //           type="approved"
  //           key={`approved-submitters-${submitter.uuid}`}
  //         />
  //       );
  //     }
  //   });
  // }

  if (issue.requestedSubmitters.length > 0 && isCreator) {
    issue.requestedSubmitters.forEach((submitter) => {
      availableCommands.push(
        <SubmitterSection
          submitter={submitter}
          type="requested"
          key={`requested-submitters-${submitter.uuid}`}
        />
      );
    });
  }

  if (isRequestedSubmitter && !isApprovedSubmitter) {
    availableCommands.push(<div>Submission Request Pending</div>);
  }

  if (!isRequestedSubmitter && isApprovedSubmitter && !isSubmitter) {
    availableCommands.push(<div>Your request to submit has been approved</div>);
  }
  console.log(issue.state, isApprovedSubmitter);
  if (issue.state === IssueState.IN_PROGRESS && isApprovedSubmitter) {
    availableCommands.push(<SubmitRequest key={`submit-request`} />);
  }
  if (
    issue.state === IssueState.AWAITING_REVIEW &&
    issue.creator.uuid === user.uuid
  ) {
    availableCommands.push(<ReviewRequest key={`review-request`} />);
  }
  if (issue.state !== IssueState.COMPLETE && (isCreator || isSubmitter)) {
    availableCommands.push(<VoterSection key={`voter-section`} />);
  }
  console.log(availableCommands);
  return availableCommands;
};

const Bounty: React.FC = () => {
  const { user, issue, issueLoadingState } = useLancer();
  const [availableCommands, setAvailableCommands] = useState([]);

  useEffect(() => {
    console.log(user, issue, issueLoadingState);
    const commands = getAvailableCommands(issue, user);
    if (!commands) {
      return;
    }
    setAvailableCommands(commands);
  }, [user?.uuid, issue, issueLoadingState]);
  if (!issue) {
    return <></>;
  }

  const descriptionMarkup = () => {
    const markdown = marked.parse(issue.description, { breaks: true });
    return { __html: markdown };
  };

  return (
    <div className="bounty-page">
      <h2 className="bounty-title">{issue.title}</h2>
      <div className="bounty-content">
        <div className="bounty-left-side">
          <SideBarSection title="Payout">
            <div>
              ${issue.amount} {getMintName(issue.mint)}
            </div>
          </SideBarSection>

          <SideBarSection title="Estimated Time">
            <div>{issue.estimatedTime} hours</div>
          </SideBarSection>
          {issue.escrowKey && (
            <SideBarSection title="Escrow Account">
              <a
                className="issue-creator"
                href={getSolscanAddress(issue.escrowKey.toString())}
                target="_blank"
                rel="noreferrer"
              >
                Escrow Account
              </a>
            </SideBarSection>
          )}

          <SideBarSection title="State">
            <div className={`issue-state ${issue.state} text-start`}>
              {issue.state}
            </div>
          </SideBarSection>
        </div>
        <div className="bounty-center">
          <div
            className="bounty-description-markup"
            dangerouslySetInnerHTML={descriptionMarkup()}
          />

          <>{...availableCommands}</>
        </div>
        <div className="bounty-right-side">
          <SideBarSection title="Creator">
            <a
              className="issue-creator"
              href={`https://github.com/${issue.org}/${issue.repo}`}
              target="_blank"
              rel="noreferrer"
            >
              {issue.org}/{issue.repo}
            </a>
          </SideBarSection>
          {issue.creator && (
            <SideBarSection title="Author">
              <div>{issue.creator.githubLogin}</div>
            </SideBarSection>
          )}
          <SideBarSection title="GitHub Links">
            <div className="bounty-github-links">
              <a
                className="issue-creator"
                href={`https://github.com/${issue.org}/${issue.repo}/issue/${issue.issueNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                Issue
              </a>
              <a
                className="issue-creator"
                href={`https://github.com/${issue.org}/${issue.repo}/pull/${issue.pullNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                Pull Request
              </a>
            </div>
          </SideBarSection>

          {issue.tags && (
            <SideBarSection title="Tags">
              <div className="bounty-tags">
                {issue.tags.map((tag, index) => (
                  <div className="tag" key={index}>
                    {capitalize(tag)}
                  </div>
                ))}
              </div>
            </SideBarSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bounty;

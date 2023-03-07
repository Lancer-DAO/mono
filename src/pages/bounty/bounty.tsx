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
import { REACT_APP_AUTH0_DOMAIN, useWeb3Auth } from "@/src/providers";
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
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import Base58 from "base-58";
import RadioWithCustomInput from "@/src/pages/fund/RadioWithCustomInput";
import { DEFAULT_MINTS, DEFAULT_MINT_NAMES } from "@/src/pages/fund/form";
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

const Bounty: React.FC = () => {
  const { wallet, anchor, program, user, issue, setIssue } = useLancer();
  const [isLoading, setIsLoading] = useState(false);
  if (!issue) {
    return <></>;
  }
  const creator = new PublicKey(issue.pubkey);
  useEffect(() => {
    const getEscrowContract = async () => {
      let escrowKey = issue.escrowKey;
      if (!escrowKey) {
        const accounts = await anchor.connection.getParsedProgramAccounts(
          program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
          {
            filters: [
              {
                dataSize: 288, // number of bytes
              },
              {
                memcmp: {
                  offset: 8, // number of bytes
                  bytes: creator.toBase58(), // base58 encoded string
                },
              },
              {
                memcmp: {
                  offset: 275, // number of bytes
                  bytes: Base58.encode(Buffer.from(issue.timestamp)), // base58 encoded string
                },
              },
            ],
          }
        );

        escrowKey = accounts[0].pubkey;

        axios.put(
          `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/escrow_key`,
          {
            org: issue.org,
            repo: issue.repo,
            issueNumber: issue.issueNumber,
            escrowKey: escrowKey.toString(),
          }
        );
      }
      const escrowContract = await getFeatureFundingAccount(escrowKey, program);
      setIssue({
        ...issue,
        escrowContract: escrowContract as unknown as EscrowContract,
      });
    };
    if (
      !issue.escrowContract &&
      program &&
      !isLoading &&
      issue.creator &&
      issue.state !== IssueState.COMPLETE
    ) {
      setIsLoading(true);
      console.log("hi");
      getEscrowContract();
    }
  }, [program, isLoading, issue]);

  const getAvailableCommands = () => {
    const availableCommands = [];
    console.log(user, issue);
    if (!user || !issue) {
      return [];
    }
    const isSubmitter = issue.submitter && issue.submitter.uuid === user.uuid;
    const isCreator = issue.creator.uuid === user.uuid;
    const isApprovedSubmitter =
      issue.approvedSubmitters.findIndex(
        (submitter) => submitter.uuid === user.uuid
      ) > -1;
    if (issue.state === IssueState.NEW && issue.creator.uuid === user.uuid) {
      availableCommands.push(<FundBounty />);
    }
    console.log(isSubmitter, isCreator, isApprovedSubmitter);
    if (
      issue.state === IssueState.ACCEPTING_APPLICATIONS ||
      (issue.state === IssueState.IN_PROGRESS &&
        !isApprovedSubmitter &&
        issue.approvedSubmitters.length < 3)
    ) {
      availableCommands.push(<RequestToSubmit />);
    }

    if (issue.approvedSubmitters.length > 0) {
      issue.approvedSubmitters.forEach((submitter) => {
        if (!submitter.isSubmitter) {
          availableCommands.push(
            <SubmitterSection submitter={submitter} type="approved" />
          );
        }
      });
    }

    if (issue.requestedSubmitters.length > 0) {
      issue.requestedSubmitters.forEach((submitter) => {
        availableCommands.push(
          <SubmitterSection submitter={submitter} type="requested" />
        );
      });
    }
    console.log(issue.state, isApprovedSubmitter);
    if (issue.state === IssueState.IN_PROGRESS && isApprovedSubmitter) {
      availableCommands.push(<SubmitRequest />);
    }
    if (
      issue.state === IssueState.AWAITING_REVIEW &&
      issue.creator.uuid === user.uuid
    ) {
      availableCommands.push(<ReviewRequest />);
    }
    if (issue.state !== IssueState.COMPLETE && (isCreator || isSubmitter)) {
      availableCommands.push(<VoterSection />);
    }
    return availableCommands;
  };

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
        <div>
          <div
            className="bounty-description-markup"
            dangerouslySetInnerHTML={descriptionMarkup()}
          />

          <>{...getAvailableCommands()}</>
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

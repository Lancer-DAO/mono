import { ACCOUNT_API_ROUTE, DATA_API_ROUTE } from "@/server/src/constants";
import { REACT_APP_CLIENTID } from "@/src/constants";
import {
  addSubmitterFFA,
  approveRequestFFA,
  cancelFFA,
  denyRequestFFA,
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
import { Issue, WEB3_INIT_STATE } from "@/types";
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

interface Props {
  issue: Issue;
}

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

const Bounty: React.FC<Props> = ({ issue }) => {
  const web3auth = useWeb3Auth();
  const {
    provider,
    loginRWA,
    getUserInfo,
    signAndSendTransaction,
    setIsLoading,
    isWeb3AuthInit,
    getBalance,
    getAccounts,
    logout,
    getWallet,
  } = web3auth;
  const [user, setUser] = useState<PublicKey>();
  const search = useLocation().search;
  const creator = new PublicKey(issue.pubkey);
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const token = jwt == null ? "" : jwt;
  const [web3AuthState, setWeb3AuthState] = useState(
    WEB3_INIT_STATE.GETTING_TOKEN
  );
  const ffa = new PublicKey(issue.escrowKey);
  useEffect(() => {
    const handleAuthLogin = async () => {
      try {
        // debugger;
        if (token !== "") {
          if (web3AuthState === WEB3_INIT_STATE.GETTING_USER && getAccounts) {
            const user = (await getAccounts())[0];
            console.log(user);
            setUser(new PublicKey(user));
            setWeb3AuthState(WEB3_INIT_STATE.READY);
          } else {
            await loginRWA(WALLET_ADAPTERS.OPENLOGIN, "jwt", token);
            setWeb3AuthState(WEB3_INIT_STATE.GETTING_USER);
          }
        } else {
          const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback?referrer=bounty?id=${
            issue.uuid
          }`}&state=STATE`;
          console.log(rwaURL);
          // debugger;
          window.location.href = rwaURL;
          setWeb3AuthState(WEB3_INIT_STATE.INITIALIZING);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (web3AuthState !== WEB3_INIT_STATE.READY) {
      handleAuthLogin();
    }
    // sessionStorage.clear();
    // window.open(REACT_APP_AUTH0_DOMAIN + "/v2/logout?federated");
  }, [web3AuthState, isWeb3AuthInit, getAccounts]);

  const descriptionMarkup = () => {
    const markdown = marked.parse(issue.description, { breaks: true });
    return { __html: markdown };
  };

  const addSubmitterFFAClick = async () => {
    // debugger;
    addSubmitterFFA(creator, creator, ffa, signAndSendTransaction, getWallet);
  };

  const removeSubmitterFFAClick = async () => {
    removeSubmitterFFA(
      creator,
      creator,
      ffa,
      signAndSendTransaction,
      getWallet
    );
  };

  const submitFFAClick = async () => {
    submitRequestFFA(creator, user, ffa, signAndSendTransaction, getWallet);
  };

  const denyRequestFFAClick = async () => {
    denyRequestFFA(creator, creator, ffa, signAndSendTransaction, getWallet);
  };

  const approveRequestFFAClick = async () => {
    approveRequestFFA(creator, creator, ffa, signAndSendTransaction, getWallet);
  };

  const voteToCancelCreatorFFAClick = async () => {
    voteToCancelFFA(creator, creator, ffa, signAndSendTransaction, getWallet);
  };

  const voteToCancelSubmitterFFAClick = async () => {
    voteToCancelFFA(creator, user, ffa, signAndSendTransaction, getWallet);
  };

  const cancelSubmitterFFAClick = async () => {
    cancelFFA(creator, ffa, signAndSendTransaction, getWallet);
  };

  const getFFAClick = async () => {
    console.log("creator", creator.toString());
    const wallet = getWallet();
    const anchorConn = new Connection(getEndpoint());

    const provider = new AnchorProvider(anchorConn, wallet, {});
    const program = new Program<MonoProgram>(
      MonoProgramJSON as unknown as MonoProgram,
      new PublicKey(MONO_DEVNET),
      provider
    );
    const acc = await getFeatureFundingAccount(ffa, program);
    console.log(acc);
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
          <SideBarSection title="Escrow Account">
            <a
              className="issue-creator"
              href={getSolscanAddress(issue.escrowKey)}
              target="_blank"
              rel="noreferrer"
            >
              Escrow Account
            </a>
          </SideBarSection>

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
          {web3AuthState === WEB3_INIT_STATE.READY && (
            <div>
              <button onClick={() => getFFAClick()}>Get FFA</button>

              <button onClick={() => addSubmitterFFAClick()}>
                Add Submitter FFA
              </button>
              <button onClick={() => removeSubmitterFFAClick()}>
                Remove Submitter FFA
              </button>
              <button onClick={() => submitFFAClick()}>
                Submit Request FFA
              </button>
              <button onClick={() => denyRequestFFAClick()}>
                Deny Request FFA
              </button>
              <button onClick={() => approveRequestFFAClick()}>
                Approve Request FFA
              </button>
              <button onClick={() => voteToCancelCreatorFFAClick()}>
                Cancel Creator FFA
              </button>

              <button onClick={() => voteToCancelSubmitterFFAClick()}>
                Cancel Submitter FFA
              </button>
              <button onClick={() => cancelSubmitterFFAClick()}>
                Cancel FFA
              </button>
            </div>
          )}
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
          <SideBarSection title="Author">
            <div>{issue.author}</div>
          </SideBarSection>
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

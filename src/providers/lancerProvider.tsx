import {
  ADAPTER_EVENTS,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
  WALLET_ADAPTER_TYPE,
} from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import type { LOGIN_PROVIDER_TYPE } from "@toruslabs/openlogin";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "../config/chainConfig";
import { WEB3AUTH_NETWORK_TYPE } from "../config/web3AuthNetwork";
import { APP_CONFIG_TYPE } from "../config/appConfig";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { SolanaWallet } from "@web3auth/solana-provider";
import { getFeatureFundingAccount, MyWallet } from "@/src/onChain";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  getApiEndpoint,
  getApiEndpointExtenstion,
  getEndpoint,
} from "@/src/utils";
import { REACT_APP_CLIENTID } from "@/src/constants";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  ACCOUNT_API_ROUTE,
  DATA_API_ROUTE,
  ISSUE_API_ROUTE,
} from "@/server/src/constants";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import Base58 from "base-58";

export const REACT_APP_CLIENT_ID =
  "BPMZUkEx6a1aHvk2h_4efBlAJNMlPGvpTOy7qIkz4cbtF_l1IHuZ7KMqsLNPTtDGDItHBMxR6peSZc8Mf-0Oj6U";
export const REACT_APP_CLIENT_ID_DEV =
  "BO2j8ZVZjLmRpGqhclE_xcPdWjGMZYMsDy5ZWgZ7FJSA-zJ2U4huIQAKKuKDe8BSABl60EQXjbFhnx78et4leB0";
export const REACT_APP_VERIFIER = "lancer0";
export const REACT_APP_AUTH0_DOMAIN = "https://dev-kgvm1sxe.us.auth0.com";
export const REACT_APP_SPA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
export const REACT_APP_RWA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
export const REACT_APP_BACKEND_SERVER_API = "http://localhost:3001/callback";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { EscrowContract, Issue, IssueState, Submitter } from "@/src/types";

export class LancerWallet extends SolanaWallet {
  pk: PublicKey;
  constructor(readonly provider: SafeEventEmitterProvider) {
    super(provider);
  }

  set pubkey(pk: PublicKey) {
    this.pk = pk;
  }

  get publicKey(): PublicKey {
    return this.pk;
  }
}

type LOGIN_STATE =
  | "logged_out"
  | "retrieving_jwt"
  | "initializing_wallet"
  | "getting_user"
  | "initializing_anchor"
  | "ready";

type ISSUE_LOAD_STATE =
  | "initializing"
  | "getting_issue"
  | "getting_submitters"
  | "getting_contract"
  | "loaded";

export interface User {
  publicKey: PublicKey;
  githubId: string;
  githugLogin: string;
  name: string;
  token: string;
  uuid?: string;
}

const getEscrowContract = async (issue: Issue, program, anchor) => {
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
              bytes: issue.creator.pubkey.toBase58(), // base58 encoded string
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
    if (accounts.length === 0) {
      return;
    }

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
  const newIssue = {
    ...issue,
    escrowContract: escrowContract as unknown as EscrowContract,
    escrowKey: escrowKey,
  };
  return newIssue;
};
const getIssue = (uuid: string) =>
  axios.get(
    `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}?id=${uuid}`
  );

const getAccounts = (uuid: string) =>
  axios.get(
    `${getApiEndpoint()}${DATA_API_ROUTE}/${ISSUE_API_ROUTE}/accounts?id=${uuid}`
  );
export const queryIssue = async (id: string) => {
  try {
    const issueResponse = await getIssue(id as string);

    const rawIssue = issueResponse.data;
    const issue: Issue = {
      ...rawIssue,
      hash: rawIssue.funding_hash,
      amount: parseFloat(rawIssue.funding_amount),
      pullNumber: rawIssue.pull_number,
      issueNumber: rawIssue.issue_number,
      githubId: rawIssue.github_id,
      payoutHash: rawIssue.payout_hash,
      authorGithub: rawIssue.github_login,
      pubkey: rawIssue.solana_pubkey,
      escrowKey: rawIssue.escrow_key && new PublicKey(rawIssue.escrow_key),
      estimatedTime: parseFloat(rawIssue.estimated_time),
      mint: rawIssue.funding_mint
        ? new PublicKey(rawIssue.funding_mint)
        : undefined,
      timestamp: rawIssue.unix_timestamp,
      description:
        rawIssue.description ||
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Blandit libero volutpat sed cras ornare. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget arcu. A erat nam at lectus urna. Mattis aliquam faucibus purus in massa tempor. A lacus vestibulum sed arcu. Id venenatis a condimentum vitae sapien. Eu lobortis elementum nibh tellus molestie nunc non blandit. Massa sapien faucibus et molestie. Sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque eu. Dis parturient montes nascetur ridiculus mus mauris vitae. Tortor posuere ac ut consequat semper viverra nam.",
    };
    console.log("issue", issue);
    // setIssue(issue);
    const accountsResponse = await getAccounts(id as string);
    const rawAccounts = accountsResponse.data;
    const accounts: Submitter[] = rawAccounts.map((account) => {
      return {
        ...account,
        githubLogin: account.github_login,
        githubId: account.github_id,
        pubkey: new PublicKey(account.solana_pubkey),
        isCreator: !!account.is_creator,
        isSubmitter: !!account.is_submitter,
        isApprovedSubmitter: !!account.is_approved_submitter,
      };
    });
    const newIssue = {
      ...issue,
      creator: accounts.find((submitter) => submitter.isCreator),
      submitter: accounts.find((submitter) => submitter.isSubmitter),
      approvedSubmitters: accounts.filter(
        (submitter) => submitter.isApprovedSubmitter
      ),
      requestedSubmitters: accounts.filter(
        (submitter) =>
          !(
            submitter.isApprovedSubmitter ||
            submitter.isSubmitter ||
            submitter.isCreator
          )
      ),
    };
    return newIssue;
  } catch (e) {
    console.error(e);
  }
};

export interface ILancerContext {
  user: User;
  issue: Issue;
  loginState: LOGIN_STATE;
  anchor: AnchorProvider;
  program: Program<MonoProgram>;
  web3Auth: Web3AuthCore;
  wallet: LancerWallet;
  issueLoadingState: ISSUE_LOAD_STATE;
  setIssue: (issue: Issue) => void;
  setIssueLoadingState: (state: ISSUE_LOAD_STATE) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const LancerContext = createContext<ILancerContext>({
  user: null,
  issue: null,
  loginState: "logged_out",
  anchor: null,
  program: null,
  web3Auth: null,
  wallet: null,
  issueLoadingState: "initializing",
  login: async () => {},
  logout: async () => {},
  setIssue: () => null,
  setIssueLoadingState: (state: ISSUE_LOAD_STATE) => null,
});

export function useLancer(): ILancerContext {
  return useContext(LancerContext);
}

interface ILancerState {
  children?: React.ReactNode;
  referrer: string;
  issueId?: string;
}
interface ILancerProps {
  children?: ReactNode;
  referrer: string;
  issueId?: string;
}

export const LancerProvider: FunctionComponent<ILancerState> = ({
  children,
  referrer,
  issueId,
}: ILancerProps) => {
  const [anchor, setAnchor] = useState<AnchorProvider | null>(null);
  const [program, setProgram] = useState<Program<MonoProgram> | null>(null);
  const [wallet, setWallet] = useState<LancerWallet | null>(null);
  const [web3Auth, setWeb3Auth] = useState<Web3AuthCore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [delayGetUser, setDelayGetUser] = useState(false);
  const [loginState, setLoginState] = useState<LOGIN_STATE | null>(
    "logged_out"
  );
  const [isGettingContract, setIsGettingContract] = useState(false);
  const search = useLocation().search;
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const [issueLoadingState, setIssueLoadingState] =
    useState<ISSUE_LOAD_STATE>("initializing");

  const setWalletProvider = useCallback(async () => {
    let provider = web3Auth.provider;
    if (!provider) {
      provider = await web3Auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
        loginProvider: "jwt",
        extraLoginOptions: {
          id_token: jwt,
          domain: REACT_APP_AUTH0_DOMAIN,
          verifierIdField: "sub",
        },
      });
    }
    console.log("setting provider");
    const walletProvider = new LancerWallet(provider);
    setTimeout(async function () {
      console.log(walletProvider);
      const accounts = await walletProvider.requestAccounts();
      walletProvider.pk = new PublicKey(accounts[0]);
      setWallet(walletProvider);
      setLoginState("getting_user");
    }, 1000);
  }, [web3Auth]);

  useEffect(() => {
    console.log("hi", loginState);
    const subscribeAuthEvents = (web3auth: Web3AuthCore) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        setUser(null);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    const currentChainConfig = CHAIN_CONFIG["solana"];

    async function init() {
      try {
        // get your client id from https://dashboard.web3auth.io by registering a plug and play application.
        // const clientId = process.env.NODE_ENV === 'development' ?
        //   REACT_APP_CLIENT_ID: REACT_APP_CLIENT_ID_DEV;
        const clientId = REACT_APP_CLIENT_ID;

        const web3AuthInstance = new Web3AuthCore({
          chainConfig: currentChainConfig,
          clientId: clientId,
        });
        subscribeAuthEvents(web3AuthInstance);
        console.log("adapter");

        const adapter = new OpenloginAdapter({
          adapterSettings: {
            network: "cyan",
            clientId,
            uxMode: "popup",
            loginConfig: {
              jwt: {
                name: "rwa Auth0 Login",
                verifier: "lancer0",
                typeOfLogin: "jwt",
                clientId: REACT_APP_RWA_CLIENTID,
              },
            },
          },
        });
        console.log("configure");

        web3AuthInstance.configureAdapter(adapter);
        console.log("init");

        await web3AuthInstance.init();

        setWeb3Auth(web3AuthInstance);
        setLoginState("initializing_wallet");
      } catch (error) {
        console.error(error);
      }
    }

    const getUser = async () => {
      const web3AuthUser = await web3Auth.getUserInfo();
      const user = await axios.get(
        `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_API_ROUTE}`,
        {
          params: {
            githubId: web3AuthUser.verifierId,
          },
        }
      );
      if (user.data.message === "NOT FOUND") {
        if (delayGetUser) {
          return;
        }

        if (!wallet.publicKey) {
          setDelayGetUser(true);
          setTimeout(() => {
            setDelayGetUser(false);
          }, 1000);
        } else {
          console.log(web3AuthUser);
          await axios.post(
            `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_API_ROUTE}`,
            {
              githubId: web3AuthUser.verifierId,
              solanaKey: wallet.publicKey.toString(),
            }
          );
          const user = await axios.get(
            `${getApiEndpoint()}${DATA_API_ROUTE}/${ACCOUNT_API_ROUTE}`,
            {
              params: {
                githubId: web3AuthUser.verifierId,
              },
            }
          );
          const connection = new Connection(getEndpoint());

          const airdrop = await connection.requestAirdrop(
            wallet.publicKey,
            LAMPORTS_PER_SOL
          );
          console.log("user", user.data, airdrop);
          setUser({
            ...user.data,
            githubId: user.data.github_id,
            githubLogin: user.data.github_login,
            publicKey: new PublicKey(user.data.solana_pubkey),
          });
          setLoginState("initializing_anchor");
        }
      } else {
        console.log("user", user.data);
        setUser({
          ...user.data,
          githubId: user.data.github_id,
          githubLogin: user.data.github_login,
          publicKey: new PublicKey(user.data.solana_pubkey),
        });
        setLoginState("initializing_anchor");
      }
    };
    // debugger;
    if (jwt === "" || jwt === null) {
      const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback?referrer=${referrer}`}&state=STATE`;
      setLoginState("retrieving_jwt");
      // debugger;
      window.location.href = rwaURL;
    } else if (
      jwt !== "" &&
      (loginState === "logged_out" || loginState === "retrieving_jwt")
    ) {
      init();
    } else if (loginState === "initializing_wallet") {
      setWalletProvider();
    } else if (loginState === "getting_user") {
      getUser();
    } else if (loginState === "initializing_anchor") {
      const connection = new Connection(getEndpoint());

      const provider = new AnchorProvider(connection, wallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_DEVNET),
        provider
      );
      setAnchor(provider);
      setProgram(program);
      setLoginState("ready");
      console.log("Lancer Ready!");
    }
  }, [
    jwt,
    loginState,
    wallet?.pubkey,
    delayGetUser,
    setDelayGetUser,
    setWalletProvider,
    setAnchor,
    setProgram,
    setLoginState,
    setUser,
    setWeb3Auth,
  ]);

  useEffect(() => {
    console.log("useEffect", issue);
    const getContract = async () => {
      console.log("getContract");
      if (
        // We haven't loaded info from on chain yet
        (!issue.escrowContract &&
          issue.creator &&
          issue.state !== IssueState.COMPLETE) ||
        // We just submitted a request, but the on chain query is still updating
        (issue.escrowContract &&
          issue.state === IssueState.AWAITING_REVIEW &&
          issue.escrowContract.currentSubmitter.toString() ===
            "11111111111111111111111111111111") ||
        // We just denied a request, but the on chain query is still updating
        (issue.escrowContract &&
          issue.state === IssueState.IN_PROGRESS &&
          issue.escrowContract.currentSubmitter.toString() !==
            "11111111111111111111111111111111")
      ) {
        setIsGettingContract(true);

        const newIssue = await getEscrowContract(issue, program, anchor);

        console.log("contract_result", newIssue);
        if (
          !newIssue ||
          (newIssue.state === IssueState.AWAITING_REVIEW &&
            newIssue.escrowContract.currentSubmitter.toString() ===
              "11111111111111111111111111111111") ||
          (newIssue.state === IssueState.IN_PROGRESS &&
            newIssue.escrowContract.currentSubmitter.toString() !==
              "11111111111111111111111111111111")
        ) {
          console.log("timedout");

          setTimeout(() => {
            setIsGettingContract(false);
          }, 2000);
        } else {
          setIssue(newIssue);
          setIssueLoadingState("loaded");
          setIsGettingContract(false);
        }
      }
    };
    console.log(issue, program, anchor, isGettingContract);
    if (
      issue &&
      program &&
      anchor &&
      anchor.connection &&
      issueLoadingState === "getting_contract" &&
      !isGettingContract
    ) {
      getContract();
    }
  }, [
    !!program,
    !!issue,
    !!anchor,
    issueLoadingState,
    setIssueLoadingState,
    isGettingContract,
    setIsGettingContract,
    setIssue,
  ]);

  useEffect(() => {
    const query = async () => {
      setIssueLoadingState("getting_issue");
      const issue = await queryIssue(issueId as string);
      setIssue(issue);
      setIssueLoadingState("getting_contract");
    };
    if (issueId !== undefined && anchor && program) {
      query();
    }
  }, [issueId, anchor, program, issue?.state]);

  const login = async () => {
    console.log("hi");
    const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback?referrer=${referrer}`}&state=STATE`;
    setLoginState("retrieving_jwt");
    // debugger;
    window.location.href = rwaURL;
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3Auth.logout();
    // if (sessionStorage.getItem("app") === "RWA") {
    window.location.href = REACT_APP_AUTH0_DOMAIN + "/v2/logout?federated";
    // }
    setAnchor(null);
    setWeb3Auth(null);
    setUser(null);
    setWallet(null);
    setProgram(null);
    window.sessionStorage.clear();
    window.location.href = "/";
  };

  const contextProvider = {
    web3Auth,
    wallet,
    anchor,
    program,
    user,
    loginState,
    login,
    logout,
    issue,
    setIssue,
    issueLoadingState,
    setIssueLoadingState,
  };
  return (
    <LancerContext.Provider value={contextProvider}>
      {children}
    </LancerContext.Provider>
  );
};

import { useEffect, useState } from "react";
import { getWalletProvider, useWeb3Auth } from "@/src/providers";
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
import { convertToQueryParams, getApiEndpoint, getEndpont } from "@/src/utils";
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
  Signer,
} from "@solana/web3.js";
import keypair from "../../../test-keypair.json";
import fromKeypair from "../../../second_wallet.json";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { userInfo } from "os";
import anchor, { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { MONO_DEVNET } from "@/escrow/sdk/constants";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import {
  addApprovedSubmittersInstruction,
  approveRequestInstruction,
  cancelFeatureInstruction,
  createFeatureFundingAccountInstruction,
  denyRequestInstruction,
  fundFeatureInstruction,
  removeApprovedSubmittersInstruction,
  submitRequestInstruction,
  voteToCancelInstruction,
} from "@/escrow/sdk/instructions";

export const WSOL_ADDRESS = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { findProgramAuthority } from "@/escrow/sdk/pda";

const secretKey = Uint8Array.from(keypair);
const keyPair = Keypair.fromSecretKey(secretKey);
const fromSecretKey = Uint8Array.from(fromKeypair);
const fromKeyPair = Keypair.fromSecretKey(fromSecretKey);
const DEFAULT_MINTS = [
  {
    name: "SOL",
    mint: undefined,
  },
  {
    name: "USDC",
    mint: DEVNET_USDC_MINT,
  },
  {
    name: "BONK",
    mint: BONK_MINT,
  },
];
const DEFAULT_MINT_NAMES = DEFAULT_MINTS.map((mint) => mint.name);

enum WEB3_INIT_STATE {
  GETTING_TOKEN = "getting_token",
  INITIALIZING = "initializing",
  GETTING_USER = "getting_user",
  READY = "ready",
}

export class MyWallet implements Wallet {
  constructor(readonly payer: Keypair) {
    this.payer = payer;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}

const Escrow = () => {
  const {
    provider,
    loginRWA,
    getUserInfo,
    signAndSendTransaction,
    setIsLoading,
    isWeb3AuthInit,
    web3Auth,
    chain,
    getBalance,
    getAccounts,
    logout,
  } = useWeb3Auth();
  const search = useLocation().search;
  const [web3AuthState, setWeb3AuthState] = useState(
    WEB3_INIT_STATE.GETTING_TOKEN
  );
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const token = jwt == null ? "" : jwt;

  const createFFA = async () => {
    if (web3AuthState === WEB3_INIT_STATE.READY) {
      const account = (await getAccounts())[0];
      let creator = keyPair;
      const wallet = new MyWallet(creator);
      const anchorConn = new Connection(getEndpont());

      const anchorProvider = new AnchorProvider(anchorConn, wallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_DEVNET),
        anchorProvider
      );
      // Add your test here.
      const WSOL_AMOUNT = 1;
      //   debugger;
      const creator_wsol_address = await getAssociatedTokenAddress(
        WSOL_ADDRESS,
        creator.publicKey
      );
      const creator_wsol_account = await getAccount(
        anchorConn,
        creator_wsol_address
      );
      let convert_to_wsol_tx = new Transaction().add(
        // trasnfer SOL
        SystemProgram.transfer({
          fromPubkey: anchorProvider.publicKey,
          toPubkey: creator_wsol_account.address,
          lamports: WSOL_AMOUNT * LAMPORTS_PER_SOL,
        }),
        // sync wrapped SOL balance
        createSyncNativeInstruction(creator_wsol_account.address)
      );

      await anchorProvider.sendAndConfirm(convert_to_wsol_tx);

      const ix = await createFeatureFundingAccountInstruction(
        WSOL_ADDRESS,
        creator.publicKey,
        program
      );

      const tx = await anchorProvider.sendAndConfirm(
        new Transaction().add(ix),
        [creator]
      );
      console.log("createFFA transaction signature", tx);
      const accounts = await anchorProvider.connection.getParsedProgramAccounts(
        program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        {
          filters: [
            {
              dataSize: 288, // number of bytes
            },
            {
              memcmp: {
                offset: 8, // number of bytes
                bytes: creator.publicKey.toBase58(), // base58 encoded string
              },
            },
          ],
        }
      );
      const acc = await program.account.featureDataAccount.fetch(
        accounts[0].pubkey
      );
      console.log(acc);
    }
  };

  useEffect(() => {
    const handleAuthLogin = async () => {
      try {
        // debugger;
        if (token !== "") {
          await loginRWA(WALLET_ADAPTERS.OPENLOGIN, "jwt", token);
          setWeb3AuthState(WEB3_INIT_STATE.READY);
        } else {
          const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_CLIENTID}&redirect_uri=${`${getApiEndpoint()}callback`}&state=STATE`;
          console.log(rwaURL);
          // debugger;
          window.location.href = rwaURL;
          setWeb3AuthState(WEB3_INIT_STATE.INITIALIZING);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (web3AuthState !== WEB3_INIT_STATE.READY && isWeb3AuthInit) {
      handleAuthLogin();
    } else {
      //   logout();
    }
    // sessionStorage.clear();
    // window.open(REACT_APP_AUTH0_DOMAIN + "/v2/logout?federated");
  }, [web3AuthState, isWeb3AuthInit, getUserInfo, getAccounts]);

  return (
    <div className="form-container">
      <div className="form-title">Create New Lancer Issue</div>
      <button onClick={() => createFFA()}>Create FFA</button>
    </div>
  );
};

export default Escrow;

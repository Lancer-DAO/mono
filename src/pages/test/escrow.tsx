import { useEffect, useState } from "react";
import { useWeb3Auth } from "@/src/providers";
import { useLocation } from "react-router-dom";
import { WALLET_ADAPTERS } from "@web3auth/base";
import {
  BONK_MINT,
  DEVNET_USDC_MINT,
  REACT_APP_AUTH0_DOMAIN,
  REACT_APP_CLIENTID,
} from "@/src/constants";
import { getApiEndpoint } from "@/src/utils";
import { Keypair, PublicKey } from "@solana/web3.js";
import keypair from "../../../test-keypair.json";
import submitterKeypair from "../../../second_wallet.json";
import {
  createFFA,
  fundFFA,
  addSubmitterFFA,
  removeSubmitterFFA,
  getFeatureFundingAccount,
  submitRequestFFA,
  denyRequestFFA,
  approveRequestFFA,
  voteToCancelFFA,
  cancelFFA,
} from "@/src/onChain";

const secretKey = Uint8Array.from(keypair);
const keyPair = Keypair.fromSecretKey(secretKey);
const submitterSecretKey = Uint8Array.from(submitterKeypair);
const submitterKeyPair = Keypair.fromSecretKey(submitterSecretKey);
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
const ffa = new PublicKey("GHqBvvSxMACYKJBZfRTwTpGET9s3BkQUtMsgSGECnaXE");
enum WEB3_INIT_STATE {
  GETTING_TOKEN = "getting_token",
  INITIALIZING = "initializing",
  GETTING_USER = "getting_user",
  READY = "ready",
}

const Escrow = () => {
  const getFFAClick = async () => {
    const acc = await getFeatureFundingAccount(keyPair, ffa);
    console.log(acc);
  };

  const createFFAClick = async () => {
    createFFA(keyPair);
  };

  const fundFFAClick = async () => {
    fundFFA(keyPair, 0.01, ffa);
  };

  const addSubmitterFFAClick = async () => {
    addSubmitterFFA(keyPair, submitterKeyPair.publicKey, ffa);
  };

  const removeSubmitterFFAClick = async () => {
    removeSubmitterFFA(keyPair, submitterKeyPair.publicKey, ffa);
  };

  const submitFFAClick = async () => {
    submitRequestFFA(keyPair, submitterKeyPair, ffa);
  };

  const denyRequestFFAClick = async () => {
    denyRequestFFA(keyPair, submitterKeyPair.publicKey, ffa);
  };

  const approveRequestFFAClick = async () => {
    approveRequestFFA(keyPair, submitterKeyPair.publicKey, ffa);
  };

  const voteToCancelCreatorFFAClick = async () => {
    voteToCancelFFA(keyPair, keyPair, ffa);
  };

  const voteToCancelSubmitterFFAClick = async () => {
    voteToCancelFFA(keyPair, submitterKeyPair, ffa);
  };

  const cancelSubmitterFFAClick = async () => {
    cancelFFA(keyPair, ffa);
  };
  return (
    <div className="form-container">
      <div className="form-title">Create New Lancer Issue</div>
      <button onClick={() => getFFAClick()}>Get FFA</button>
      <button onClick={() => createFFAClick()}>Create FFA</button>
      <button onClick={() => fundFFAClick()}>Fund FFA</button>
      <button onClick={() => addSubmitterFFAClick()}>Add Submitter FFA</button>
      <button onClick={() => removeSubmitterFFAClick()}>
        Remove Submitter FFA
      </button>
      <button onClick={() => submitFFAClick()}>Submit Request FFA</button>
      <button onClick={() => denyRequestFFAClick()}>Deny Request FFA</button>
      <button onClick={() => approveRequestFFAClick()}>
        Approve Request FFA
      </button>
      <button onClick={() => voteToCancelCreatorFFAClick()}>
        Cancel Creator FFA
      </button>

      <button onClick={() => voteToCancelSubmitterFFAClick()}>
        Cancel Submitter FFA
      </button>
      <button onClick={() => cancelSubmitterFFAClick()}>Cancel FFA</button>
    </div>
  );
};

export default Escrow;

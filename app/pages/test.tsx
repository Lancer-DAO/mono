import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/quests/Quests/Quests";
import { NextSeo } from "next-seo";
import { useUserWallet } from "@/src/providers";
import {
  createFFA,
  sendInvoice,
  acceptInvoice,
  rejectInvoice,
  closeInvoice,
  addSubmitterFFAOld,
  submitRequestFFA,
  approveRequestFFAOld,
} from "@/escrow/adapters";
import { PublicKey } from "@solana/web3.js";
import { USDC_MINT } from "@/src/constants";
import { Escrow } from "@/types";

export const getServerSideProps = withPageAuthRequired();

const TIMESTAMP = "1691549508859";

const CLIENT_WALLET = new PublicKey(
  "BuxU7uwwkoobF8p4Py7nRoTgxWRJfni8fc4U3YKGEXKs"
);
const LANCER_WALLET = new PublicKey(
  "WbmLPptTGZTFK5ZSks7oaa4Qx69qS3jFXMrAsbWz1or"
);

const FUND_AMOUNT = 0.001;

const BountiesPage: React.FC = () => {
  const { currentWallet, program, provider } = useUserWallet();

  const createFFAClick = async () => {
    const { timestamp, signature, escrowKey } = await createFFA(
      currentWallet,
      program,
      provider,
      new PublicKey(USDC_MINT)
    );
  };

  const sendInvoiceClick = async () => {
    const signature = await sendInvoice(
      CLIENT_WALLET,
      { timestamp: TIMESTAMP } as Escrow,
      currentWallet,
      program,
      provider,
      FUND_AMOUNT
    );
    console.log("timestamp", signature);
  };

  const acceptInvoiceClick = async () => {
    const signature = await acceptInvoice(
      LANCER_WALLET,
      { timestamp: TIMESTAMP } as Escrow,
      currentWallet,
      program,
      provider
    );
    console.log("timestamp", signature);
  };

  const addApprovedSubmitterClick = async () => {
    const signature = await addSubmitterFFAOld(
      LANCER_WALLET,
      { timestamp: TIMESTAMP } as Escrow,
      currentWallet,
      program,
      provider
    );
    console.log("timestamp", signature);
  };

  const submitClick = async () => {
    const signature = await submitRequestFFA(
      CLIENT_WALLET,
      LANCER_WALLET,
      { timestamp: TIMESTAMP, mint: { publicKey: USDC_MINT } } as Escrow,
      currentWallet,
      program,
      provider
    );
    console.log("timestamp", signature);
  };

  const approveClick = async () => {
    const signature = await approveRequestFFAOld(
      LANCER_WALLET,
      { timestamp: TIMESTAMP, mint: { publicKey: USDC_MINT } } as Escrow,
      currentWallet,
      program,
      provider
    );
    console.log("timestamp", signature);
  };

  const rejectInvoiceClick = async () => {
    const signature = await rejectInvoice(
      LANCER_WALLET,
      { timestamp: TIMESTAMP } as Escrow,
      currentWallet,
      program,
      provider
    );
    console.log("timestamp", signature);
  };

  const closeInvoiceClick = async () => {
    const signature = await closeInvoice(
      { timestamp: TIMESTAMP } as Escrow,
      currentWallet,
      program,
      provider
    );
    console.log("timestamp", signature);
  };

  return (
    <>
      <NextSeo title="Lancer | Bounties" description="Lancer Bounties" />
      <div onClick={createFFAClick}>Create FFA</div>
      <div onClick={sendInvoiceClick}>Send Invoice</div>
      <div onClick={acceptInvoiceClick}>Accept Invoice</div>
      <div onClick={addApprovedSubmitterClick}>Approve Submitter</div>
      <div onClick={submitClick}>Submit Request</div>
      <div onClick={approveClick}>Approve Request</div>
      <div onClick={rejectInvoiceClick}>Reject Invoice</div>
      <div onClick={closeInvoiceClick}>Close Invoice</div>
    </>
  );
};

export default BountiesPage;

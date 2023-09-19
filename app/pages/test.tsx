import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties/Bounties";
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
import { UpdateTable } from "@/components";

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
  return (
    <>
      <UpdateTable />
    </>
  );
};

export default BountiesPage;
